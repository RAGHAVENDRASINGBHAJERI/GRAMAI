from pydantic import BaseModel, Field
from typing import Optional, List


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000, description="User's question")
    language: str = Field(default="en", pattern="^(en|hi|kn)$", description="Language code")
    category: str = Field(default="general", pattern="^(agriculture|health|schemes|mandi|general)$")


class QueryResponse(BaseModel):
    answer: str = Field(..., description="AI-generated answer")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    category: str = Field(..., description="Matched category")
    relatedQuestions: List[str] = Field(default_factory=list, description="Related questions")


class HealthResponse(BaseModel):
    status: str = Field(default="ok")
    model: str = Field(default="loaded")
    total_entries: int = Field(default=0)


class DetectRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Text to detect language from")


class DetectResponse(BaseModel):
    language: str = Field(..., pattern="^(en|hi|kn)$", description="Detected language")

