"""
TF-IDF based question-answering engine.
Uses cosine similarity to find the best matching answer from the dataset.
"""

import json
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple, Optional
import joblib


class TFIDFEngine:
    """TF-IDF based question matching engine."""

    def __init__(self, data_path: str = "./data"):
        self.data_path = data_path
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix: Optional[np.ndarray] = None
        self.entries: List[Dict] = []
        self.questions: List[str] = []
        self.is_loaded = False

    def load_data(self) -> int:
        """
        Load all QA datasets from the data directory.
        Returns total number of entries loaded.
        """
        self.entries = []
        self.questions = []

        data_files = [
            'agri_qa.json',
            'health_qa.json',
            'schemes_qa.json',
            'mandi_qa.json',
        ]

        for filename in data_files:
            filepath = os.path.join(self.data_path, filename)
            if os.path.exists(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        for entry in data:
                            self.entries.append(entry)
                            # Add all language variants of the question
                            if entry.get('question_en'):
                                self.questions.append(entry['question_en'])
                            if entry.get('question_hi'):
                                self.questions.append(entry['question_hi'])
                            if entry.get('question_kn'):
                                self.questions.append(entry['question_kn'])
                except Exception as e:
                    print(f"Error loading {filename}: {e}")

        print(f"Loaded {len(self.entries)} entries with {len(self.questions)} question variants")
        return len(self.entries)

    def build_vectorizer(self) -> None:
        """Build TF-IDF vectorizer on the loaded questions."""
        if not self.questions:
            raise ValueError("No questions loaded. Call load_data() first.")

        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words=None,  # Don't filter stopwords - they're important for multilingual matching
            ngram_range=(1, 3),  # Use up to 3-grams for better phrase matching
            sublinear_tf=True,
            analyzer='char_wb',  # Character-level analysis works better for multilingual text
            token_pattern=None,  # Disable token pattern to allow all characters
        )

        self.tfidf_matrix = self.vectorizer.fit_transform(self.questions)
        self.is_loaded = True
        print(f"TF-IDF matrix built: {self.tfidf_matrix.shape}")

    def find_best_match(
        self, query: str, top_k: int = 3
    ) -> List[Tuple[Dict, float, int]]:
        """
        Find the best matching entries for a query.
        Returns list of (entry, confidence_score, question_index) tuples.
        """
        if not self.is_loaded or self.vectorizer is None:
            raise ValueError("Engine not initialized. Call load_data() and build_vectorizer() first.")

        # Vectorize the query
        query_vec = self.vectorizer.transform([query])

        # Calculate cosine similarity
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # Get top-k matches
        top_indices = similarities.argsort()[-top_k:][::-1]

        results = []
        seen_entry_ids = set()

        for idx in top_indices:
            confidence = float(similarities[idx])

            # Map question index back to entry
            # Each entry has 3 question variants, so divide by 3
            entry_idx = idx // 3
            if entry_idx < len(self.entries) and entry_idx not in seen_entry_ids:
                seen_entry_ids.add(entry_idx)
                results.append((self.entries[entry_idx], confidence, idx))

        return results

    def get_answer(
        self, query: str, language: str = 'en', category: str = 'general',
        confidence_threshold: float = 0.3
    ) -> Dict:
        """
        Get the best answer for a query.
        Returns dict with answer, confidence, category, and related questions.
        """
        matches = self.find_best_match(query, top_k=3)

        if not matches or matches[0][1] < confidence_threshold:
            return {
                'answer': f"I don't have specific information on that. Try rephrasing your question.",
                'confidence': 0.0,
                'category': category,
                'relatedQuestions': [],
            }

        best_entry, best_confidence, _ = matches[0]

        # Get answer in the requested language
        answer_key = f'answer_{language}'
        answer = best_entry.get(answer_key) or best_entry.get('answer_en', '')

        # Get related questions (from other matches)
        related_questions = []
        for entry, conf, _ in matches[1:]:
            q_key = f'question_{language}'
            q = entry.get(q_key) or entry.get('question_en', '')
            if q:
                related_questions.append(q)

        return {
            'answer': answer,
            'confidence': round(best_confidence, 4),
            'category': best_entry.get('category', category),
            'relatedQuestions': related_questions[:3],
        }

    def save_model(self, path: str) -> None:
        """Save the trained vectorizer and matrix to disk."""
        if not self.is_loaded:
            raise ValueError("Engine not initialized.")
        
        model_data = {
            'vectorizer': self.vectorizer,
            'entries': self.entries,
            'questions': self.questions,
        }
        joblib.dump(model_data, path)
        print(f"Model saved to {path}")

    def load_model(self, path: str) -> bool:
        """Load a pre-trained model from disk."""
        if not os.path.exists(path):
            print(f"Model file not found: {path}")
            return False

        try:
            model_data = joblib.load(path)
            self.vectorizer = model_data['vectorizer']
            self.entries = model_data['entries']
            self.questions = model_data['questions']
            self.tfidf_matrix = self.vectorizer.transform(self.questions)
            self.is_loaded = True
            print(f"Model loaded from {path}")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False


# Singleton instance
_engine_instance: Optional[TFIDFEngine] = None


def get_engine() -> TFIDFEngine:
    """Get or create the singleton TF-IDF engine instance."""
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = TFIDFEngine()
    return _engine_instance
