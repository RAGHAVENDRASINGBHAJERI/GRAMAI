"""
GramaAI Lite - AI Engine
FastAPI application for TF-IDF based question answering.
"""

import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routers.chat import router as chat_router
from services.tfidf_engine import get_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan: load data and build TF-IDF model on startup.
    """
    print("=" * 50)
    print("GramaAI Lite - AI Engine Starting")
    print("=" * 50)

    # Get data path from environment or use default
    data_path = os.environ.get('DATA_PATH', os.path.join(os.path.dirname(__file__), 'data'))
    model_path = os.environ.get('MODEL_PATH', os.path.join(os.path.dirname(__file__), 'models', 'tfidf_model.pkl'))

    # Initialize the TF-IDF engine
    engine = get_engine()
    engine.data_path = data_path

    # Try to load pre-trained model first, otherwise build from data
    if os.path.exists(model_path):
        print(f"Loading pre-trained model from {model_path}")
        engine.load_model(model_path)
    else:
        print("No pre-trained model found. Loading data and building vectorizer...")
        engine.load_data()
        engine.build_vectorizer()
        # Save the model for future use
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        engine.save_model(model_path)

    print(f"Engine ready: {len(engine.entries)} entries, {len(engine.questions)} question variants")
    print("=" * 50)

    yield

    print("AI Engine shutting down...")


# Create FastAPI app
app = FastAPI(
    title="GramaAI Lite - AI Engine",
    description="TF-IDF based multilingual question answering for rural Indian users",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router)


@app.get("/")
async def root():
    return {
        "name": "GramaAI Lite - AI Engine",
        "version": "1.0.0",
        "status": "running",
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )
