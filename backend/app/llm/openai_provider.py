import json
import httpx
from typing import Dict, Any, List, Optional
from app.llm.base import BaseLLMProvider

class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", model: str = "gpt-4o-mini"):
        super().__init__(api_key=api_key, model=model or "gpt-4o-mini")
        self.base_url = "https://api.openai.com/v1"

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("OpenAI API key is missing. Please configure it in Settings or environment variables.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature
        }

        if tools:
            payload["tools"] = [{"type": "function", "function": t} for t in tools]
            payload["tool_choice"] = "auto"

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"OpenAI API Error ({resp.status_code}): {resp.text}")

            data = resp.json()
            choice = data["choices"][0]["message"]
            content = choice.get("content") or ""
            parsed_tool_calls = []

            if "tool_calls" in choice and choice["tool_calls"]:
                for tc in choice["tool_calls"]:
                    fn = tc.get("function", {})
                    fn_name = fn.get("name", "")
                    try:
                        args = json.loads(fn.get("arguments", "{}"))
                    except Exception:
                        args = {"raw": fn.get("arguments", "")}
                    parsed_tool_calls.append({"name": fn_name, "arguments": args})

            return {
                "content": content,
                "tool_calls": parsed_tool_calls,
                "raw": data
            }

