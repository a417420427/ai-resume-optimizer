from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# --- Auth ---
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
    email: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "Bearer"


class UserInfo(BaseModel):
    id: int
    username: str
    nickname: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    is_vip: bool
    optimize_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Resume & Optimization ---
class OptimizationRequest(BaseModel):
    target_position: Optional[str] = None
    target_industry: Optional[str] = None
    tone: Optional[str] = "professional"  # professional, concise, creative
    language: Optional[str] = "zh"  # zh, en


class SuggestionItem(BaseModel):
    type: str  # content, format, keyword, ats
    severity: str  # high, medium, low
    title: str
    description: str
    suggestion: str


class KeywordAnalysis(BaseModel):
    matched_keywords: List[str]
    missing_keywords: List[str]
    keyword_density: float  # 0-100
    suggestions: List[str]


class OptimizationResult(BaseModel):
    id: int
    score: int
    summary: str
    optimized_text: str
    suggestions: List[SuggestionItem]
    keyword_matches: KeywordAnalysis
    ats_feedback: str
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeInfo(BaseModel):
    id: int
    original_filename: str
    file_type: str
    created_at: datetime

    class Config:
        from_attributes = True
