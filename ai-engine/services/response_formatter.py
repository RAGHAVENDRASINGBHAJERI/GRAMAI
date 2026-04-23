"""
Response formatter service.
Formats AI responses with proper language handling and structure.
"""

from typing import Dict, List, Optional


class ResponseFormatter:
    """Formats AI responses with language-aware formatting."""

    def __init__(self):
        self.confidence_labels = {
            'high': (0.7, 1.0),
            'medium': (0.4, 0.7),
            'low': (0.0, 0.4),
        }

    def get_confidence_label(self, confidence: float) -> str:
        """Get a human-readable confidence label."""
        for label, (low, high) in self.confidence_labels.items():
            if low <= confidence < high:
                return label
        return 'low'

    def format_response(
        self,
        answer: str,
        confidence: float,
        category: str,
        related_questions: Optional[List[str]] = None,
        source: str = 'ai-engine',
    ) -> Dict:
        """
        Format the AI response into a standardized structure.
        """
        return {
            'answer': answer,
            'confidence': confidence,
            'confidenceLabel': self.get_confidence_label(confidence),
            'category': category,
            'source': source,
            'relatedQuestions': related_questions or [],
        }

    def format_no_match(self, language: str = 'en') -> Dict:
        """Format a no-match response in the appropriate language."""
        messages = {
            'en': "I don't have specific information on that. Try rephrasing your question or ask about agriculture, health, government schemes, or market prices.",
            'hi': "मेरे पास इस बारे में विशेष जानकारी नहीं है। कृपया अपना प्रश्न दोबारा लिखें या कृषि, स्वास्थ्य, सरकारी योजनाओं या मंडी मूल्यों के बारे में पूछें।",
            'kn': "ಈ ಬಗ್ಗೆ ನನ್ನ ಬಳಿ ನಿರ್ದಿಷ್ಟ ಮಾಹಿತಿ ಇಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮರುರೂಪಿಸಿ ಅಥವಾ ಕೃಷಿ, ಆರೋಗ್ಯ, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಅಥವಾ ಮಂಡಿ ಬೆಲೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ.",
        }
        return self.format_response(
            answer=messages.get(language, messages['en']),
            confidence=0.0,
            category='general',
            source='ai-engine',
        )


# Singleton instance
_formatter_instance: Optional[ResponseFormatter] = None


def get_formatter() -> ResponseFormatter:
    """Get or create the singleton formatter instance."""
    global _formatter_instance
    if _formatter_instance is None:
        _formatter_instance = ResponseFormatter()
    return _formatter_instance
