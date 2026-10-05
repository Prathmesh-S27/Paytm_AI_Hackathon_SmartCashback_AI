import json
import asyncio
from google import genai
from pydantic import ValidationError
from app.core.config import settings
from app.schemas.gemini import GeminiRecommendationRequest, GeminiRecommendationResponse

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            
    async def rank_recommendations(self, context: dict) -> GeminiRecommendationResponse | None:
        if not self.client:
            return None
            
        try:
            req_data = GeminiRecommendationRequest(**context)
        except ValidationError:
            return None
            
        prompt = f"""
You are an expert recommendation engine for a cashback platform.
Rank the candidate merchants for the user based on context.
Current Category: {req_data.current_category}
Current Transaction Amount: {req_data.current_amount}
User Category Average Spend: {req_data.user_category_average}

Candidates:
{json.dumps([c.model_dump(mode='json') for c in req_data.candidates], indent=2)}

Rules:
1. Provide a reason for each recommended merchant.
2. Confidence score between 0.0 and 1.0.
3. Return ONLY valid JSON matching this schema:
{{
  "recommended_merchants": [
    {{"merchant_id": "uuid", "reason": "text", "confidence": 0.9}}
  ]
}}
"""
        
        def call_gemini():
            response = self.client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json",
                )
            )
            return response.text
            
        try:
            loop = asyncio.get_running_loop()
            text_response = await asyncio.wait_for(
                loop.run_in_executor(None, call_gemini),
                timeout=10.0
            )
            data = json.loads(text_response)
            return GeminiRecommendationResponse(**data)
        except Exception:
            return None
