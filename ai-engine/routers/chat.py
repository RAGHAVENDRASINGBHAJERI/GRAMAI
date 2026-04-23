"""
FastAPI router for chat/query endpoints.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException
from schemas.chat_schema import QueryRequest, QueryResponse, HealthResponse, DetectRequest, DetectResponse
from services.tfidf_engine import get_engine
from services.language_detector import detect_language, normalize_text
from services.response_formatter import get_formatter

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Process a user query and return the best matching answer.
    """
    try:
        engine = get_engine()
        formatter = get_formatter()

        # Use the user's selected language; only auto-detect if not provided
        language = request.language if request.language else detect_language(request.question)

        # Normalize the query text
        normalized_query = normalize_text(request.question, language)

        # Get answer from TF-IDF engine
        result = engine.get_answer(
            query=normalized_query,
            language=language,
            category=request.category,
        )

        # Format the response
        formatted = formatter.format_response(
            answer=result['answer'],
            confidence=result['confidence'],
            category=result['category'],
            related_questions=result['relatedQuestions'],
        )

        return QueryResponse(**formatted)

    except ValueError as e:
        raise HTTPException(status_code=503, detail=f"AI Engine not initialized: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    engine = get_engine()
    return HealthResponse(
        status="ok",
        model="loaded" if engine.is_loaded else "not_loaded",
        total_entries=len(engine.entries),
    )


@router.post("/detect", response_model=DetectResponse)
async def detect_language_endpoint(request: DetectRequest):
    """Detect language from text."""
    from services.language_detector import detect_language
    detected = detect_language(request.text)
    return DetectResponse(language=detected)


@router.post("/retrain")
async def retrain_model():
    """
    Retrain the TF-IDF model from the data files.
    This endpoint is for internal/admin use.
    """
    try:
        engine = get_engine()
        engine.load_data()
        engine.build_vectorizer()
        # Save the retrained model
        model_path = os.environ.get('MODEL_PATH', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'tfidf_model.pkl'))
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        engine.save_model(model_path)
        return {"message": "Model retrained and saved successfully", "entries": len(engine.entries)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrain failed: {str(e)}")
