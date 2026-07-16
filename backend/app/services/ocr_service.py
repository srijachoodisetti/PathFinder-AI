import base64
from app.services.gemini_service import GeminiService

class OCRService:
    @staticmethod
    def scan_handwritten_image(image_base64: str) -> str:
        """
        Parses base64 images of handwritten text/equations.
        Leverages Gemini's native vision capability to extract the core text questions.
        """
        # Decode helper validation
        try:
            clean_b64 = image_base64.split(",")[-1] if "," in image_base64 else image_base64
            base64.b64decode(clean_b64)
        except Exception:
            return "Failed to parse image data"

        # Ask Gemini to do the OCR extraction
        result = GeminiService.get_tutor_response(
            prompt="Analyze this image. Transcribe all text, questions, and mathematical equations. Return only the extracted text.",
            image_base64=image_base64
        )
        return result.get("response_text", "Could not read handwriting. Please try taking a clearer photo.")
        
    @staticmethod
    def check_file_extension(filename: str) -> bool:
        allowed = {"png", "jpg", "jpeg", "pdf"}
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        return ext in allowed
