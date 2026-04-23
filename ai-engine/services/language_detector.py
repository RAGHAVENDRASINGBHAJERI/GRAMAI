"""
Language detection service for identifying query language.
Uses langdetect library with fallback to character-based detection.
"""

from langdetect import detect, DetectorFactory, LangDetectException
import re

# Set seed for reproducibility
DetectorFactory.seed = 0

# Language code mapping
LANGUAGE_MAP = {
    'en': 'en',
    'hi': 'hi',
    'kn': 'kn',
    'mr': 'hi',  # Marathi -> Hindi fallback
    'gu': 'hi',  # Gujarati -> Hindi fallback
    'ta': 'kn',  # Tamil -> Kannada fallback (South Indian)
    'te': 'kn',  # Telugu -> Kannada fallback
    'ml': 'kn',  # Malayalam -> Kannada fallback
}

# Unicode ranges for Indian languages
DEVANAGARI_RANGE = range(0x0900, 0x097F)  # Hindi, Marathi, etc.
KANNADA_RANGE = range(0x0C80, 0x0CFF)      # Kannada


def detect_language(text: str) -> str:
    """
    Detect the language of the input text.
    Returns one of: 'en', 'hi', 'kn'
    """
    if not text or not text.strip():
        return 'en'

    # Check for Kannada script first (most reliable)
    if has_kannada_script(text):
        return 'kn'

    # Check for Devanagari script (Hindi, Marathi, etc.)
    if has_devanagari_script(text):
        return 'hi'

    # Use langdetect for Latin script / English
    try:
        lang = detect(text)
        mapped = LANGUAGE_MAP.get(lang, 'en')
        return mapped
    except LangDetectException:
        return 'en'


def has_kannada_script(text: str) -> bool:
    """Check if text contains Kannada characters."""
    for char in text:
        if ord(char) in KANNADA_RANGE:
            return True
    return False


def has_devanagari_script(text: str) -> bool:
    """Check if text contains Devanagari characters."""
    for char in text:
        if ord(char) in DEVANAGARI_RANGE:
            return True
    return False


def normalize_text(text: str, language: str = 'en') -> str:
    """
    Normalize text for processing.
    - Lowercase for English
    - Remove extra whitespace
    - Remove special characters (keep language-specific chars)
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    if language == 'en':
        text = text.lower()
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^a-z0-9\s\?\.]', '', text)

    # For Hindi and Kannada, keep the native script characters
    return text
