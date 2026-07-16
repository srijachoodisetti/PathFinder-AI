import urllib.parse

class SpeechService:
    @staticmethod
    def get_tts_url(text: str, language_code: str = "en") -> str:
        """
        Generates a direct Google Text-to-Speech audio link.
        This provides free, high-quality audio clips directly from the browser/backend without keys.
        """
        # Map our support languages to Google TTS codes
        lang_map = {
            "english": "en",
            "hindi": "hi",
            "telugu": "te",
            "tamil": "ta",
            "kannada": "kn",
            "malayalam": "ml",
            "marathi": "mr",
            "bengali": "bn"
        }
        
        lang = lang_map.get(language_code.lower(), "en")
        encoded_text = urllib.parse.quote(text[:200])  # Limit length for direct URL compatibility
        return f"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang}&client=tw-ob&q={encoded_text}"
