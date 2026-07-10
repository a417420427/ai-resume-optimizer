import json
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import Resume, OptimizationResult
from pydantic import BaseModel
from app.schemas import OptimizationRequest, OptimizationResult as OptimizationResultSchema, ResumeInfo
from app.services.ai_service import AIService
from app.services.file_service import FileService
from app.services.doc_service import DocService
from app.core.config import FREE_TIER_LIMIT

router = APIRouter(prefix="/resume", tags=["Resume Analysis"])
ai_service = AIService()
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    target_position: Optional[str] = Form(None),
    target_industry: Optional[str] = Form(None),
    language: str = Form("zh"),
    tone: str = Form("professional"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a resume and run AI optimization."""

    # Check free tier limit
    if not current_user.is_vip and current_user.optimize_count >= FREE_TIER_LIMIT:
        raise HTTPException(
            status_code=402,
            detail=f"免费用户只能优化 {FREE_TIER_LIMIT} 次，请升级 VIP",
        )

    # Validate file type
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"不支持的文件格式，支持: {', '.join(ALLOWED_EXTENSIONS)}")

    # Read and save file
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="文件大小不能超过 10MB")

    file_type = ext.lstrip(".")
    file_path = FileService.save_file(file_bytes, file.filename, current_user.id)

    # Extract text
    try:
        raw_text = FileService.extract_text(file_path, file_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="无法从文件中提取文本内容")

    # Save resume record
    resume = Resume(
        user_id=current_user.id,
        original_filename=file.filename,
        file_path=file_path,
        file_type=file_type,
        raw_text=raw_text,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Run AI optimization
    try:
        result = ai_service.optimize_resume(
            resume_text=raw_text,
            target_position=target_position,
            target_industry=target_industry,
            tone=tone,
            language=language,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Still save the resume even if AI fails
        raise HTTPException(status_code=500, detail=f"AI 分析失败: {str(e)}")

    # Save optimization result
    opt_result = OptimizationResult(
        resume_id=resume.id,
        user_id=current_user.id,
        optimized_text=result.get("optimized_text", ""),
        summary=result.get("summary", ""),
        score=result.get("score", 0),
        suggestions=json.dumps(result.get("suggestions", []), ensure_ascii=False),
        keyword_matches=json.dumps(result.get("keyword_matches", {}), ensure_ascii=False),
        ats_feedback=result.get("ats_feedback", ""),
        target_position=target_position,
        target_industry=target_industry,
        match_score=result.get("keyword_matches", {}).get("keyword_density", 0),
    )
    db.add(opt_result)

    # Increment user's optimize count
    current_user.optimize_count += 1
    db.commit()
    db.refresh(opt_result)

    return {
        "optimization_id": opt_result.id,
        "resume_id": resume.id,
        "score": result.get("score", 0),
        "summary": result.get("summary", ""),
        "optimized_text": result.get("optimized_text", ""),
        "suggestions": result.get("suggestions", []),
        "keyword_matches": result.get("keyword_matches", {}),
        "ats_feedback": result.get("ats_feedback", ""),
        "optimize_count": current_user.optimize_count,
        "free_tier_limit": FREE_TIER_LIMIT,
    }


class ResumeHistoryItem(BaseModel):
    id: int
    original_filename: str
    file_type: str
    optimization_id: Optional[int] = None
    created_at: str

    class Config:
        from_attributes = True


@router.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's resume upload history with latest optimization result."""
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .limit(20)
        .all()
    )
    result = []
    for r in resumes:
        opt = db.query(OptimizationResult).filter(
            OptimizationResult.resume_id == r.id
        ).order_by(OptimizationResult.created_at.desc()).first()
        result.append({
            "id": r.id,
            "original_filename": r.original_filename,
            "file_type": r.file_type,
            "optimization_id": opt.id if opt else None,
            "created_at": r.created_at.isoformat(),
        })
    return result


@router.get("/result/{optimization_id}", response_model=OptimizationResultSchema)
def get_result(
    optimization_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific optimization result."""
    result = db.query(OptimizationResult).filter(
        OptimizationResult.id == optimization_id,
        OptimizationResult.user_id == current_user.id,
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="未找到该优化记录")

    return {
        "id": result.id,
        "score": result.score,
        "summary": result.summary,
        "optimized_text": result.optimized_text,
        "suggestions": json.loads(result.suggestions) if result.suggestions else [],
        "keyword_matches": json.loads(result.keyword_matches) if result.keyword_matches else {},
        "ats_feedback": result.ats_feedback,
        "created_at": result.created_at,
    }


@router.post("/chat/{optimization_id}")
def chat_about_resume(
    optimization_id: int,
    question: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Chat with AI about a previously optimized resume."""
    result = db.query(OptimizationResult).filter(
        OptimizationResult.id == optimization_id,
        OptimizationResult.user_id == current_user.id,
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="未找到该优化记录")

    resume = db.query(Resume).filter(Resume.id == result.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="未找到简历记录")

    try:
        answer = ai_service.chat_about_resume(resume.raw_text, question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 回复失败: {str(e)}")


@router.get("/templates")
def get_templates():
    """Get available resume templates."""
    return DocService.get_templates()


@router.get("/download/{optimization_id}")
def download_resume(
    optimization_id: int,
    fmt: str = "docx",
    template: str = "modern",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download optimized resume as DOCX or PDF with template selection."""
    result = db.query(OptimizationResult).filter(
        OptimizationResult.id == optimization_id,
        OptimizationResult.user_id == current_user.id,
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="未找到该优化记录")
    if not result.optimized_text:
        raise HTTPException(status_code=400, detail="优化结果无文本内容")

    if fmt == "pdf":
        content, filename = DocService.to_pdf(result.optimized_text, template)
        media_type = "application/pdf"
    else:
        content, filename = DocService.to_docx(result.optimized_text, template)
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
