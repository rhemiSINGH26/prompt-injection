import json
import httpx
from typing import Dict, Any, List, Optional
from app.llm.base import BaseLLMProvider

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", model: str = "gemini-1.5-flash"):
        super().__init__(api_key=api_key, model=model or "gemini-1.5-flash")
        # Standardize model names if needed
        if "gemini" not in self.model:
            self.model = "gemini-1.5-flash"

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("Gemini API key is missing. Please configure it in Settings or environment variables.")

        # Convert chat messages to Gemini content format
        system_instruction = None
        contents = []
        for m in messages:
            role = m.get("role", "user")
            text = m.get("content", "")
            if role == "system":
                system_instruction = {"parts": [{"text": text}]}
            else:
                gemini_role = "user" if role == "user" else "model"
                contents.append({
                    "role": gemini_role,
                    "parts": [{"text": text}]
                })

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature
            }
        }
        if system_instruction:
            payload["systemInstruction"] = system_instruction

        if tools:
            function_declarations = []
            for t in tools:
                function_declarations.append({
                    "name": t.get("name"),
                    "description": t.get("description", ""),
                    "parameters": t.get("parameters", {})
                })
            payload["tools"] = [{"functionDeclarations": function_declarations}]

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API Error ({resp.status_code}): {resp.text}")

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return {"content": "", "tool_calls": [], "raw": data}

            parts = candidates[0].get("content", {}).get("parts", [])
            content_texts = []
            tool_calls = []

            for part in parts:
                if "text" in part:
                    content_texts.append(part["text"])
                if "functionCall" in part:
                    fc = part["functionCall"]
                    tool_calls.append({
                        "name": fc.get("name", ""),
                        "arguments": fc.get("args", {})
                    })

            return {
                "content": "\n".join(content_texts),
                "tool_calls": tool_calls,
                "raw": data
            }

