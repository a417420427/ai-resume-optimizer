from pathlib import Path
import fitz  # PyMuPDF
from docx import Document
import os


class FileService:
    """Handle file uploads and text extraction."""

    UPLOAD_DIR = Path("./uploads")

    @classmethod
    def ensure_upload_dir(cls):
        cls.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    @classmethod
    def save_file(cls, file_bytes: bytes, filename: str, user_id: int) -> str:
        """Save uploaded file and return the file path."""
        cls.ensure_upload_dir()
        user_dir = cls.UPLOAD_DIR / str(user_id)
        user_dir.mkdir(exist_ok=True)

        filepath = user_dir / filename
        with open(filepath, "wb") as f:
            f.write(file_bytes)
        return str(filepath)

    @classmethod
    def extract_text(cls, file_path: str, file_type: str) -> str:
        """Extract text from PDF, DOCX, or TXT files."""
        file_type = file_type.lower()
        if file_type == "pdf":
            return cls._extract_from_pdf(file_path)
        elif file_type == "docx":
            return cls._extract_from_docx(file_path)
        elif file_type == "txt":
            return cls._extract_from_txt(file_path)
        else:
            raise ValueError(f"不支持的文件类型: {file_type}")

    @classmethod
    def _extract_from_pdf(cls, file_path: str) -> str:
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            raise ValueError(f"PDF 解析失败: {str(e)}")
        return text.strip()

    @classmethod
    def _extract_from_docx(cls, file_path: str) -> str:
        try:
            doc = Document(file_path)
            text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
            return text.strip()
        except Exception as e:
            raise ValueError(f"DOCX 解析失败: {str(e)}")

    @classmethod
    def _extract_from_txt(cls, file_path: str) -> str:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read().strip()
        except UnicodeDecodeError:
            with open(file_path, "r", encoding="gbk") as f:
                return f.read().strip()
