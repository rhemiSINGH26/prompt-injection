import json
import httpx
from typing import Dict, Any, List, Optional
from app.llm.base import BaseLLMProvider

class OllamaProvider(BaseLLMProvider):
    def __init__(self, api_key: str = "", model: str = "llama3:latest", base_url: str = "http://localhost:11434"):
        super().__init__(api_key=api_key, model=model or "llama3:latest")
        self.base_url = base_url

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature}
        }
        if tools:
            payload["tools"] = tools

        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                resp = await client.post(f"{self.base_url}/api/chat", json=payload)
            except Exception as e:
                raise RuntimeError(f"Ollama connection error: {str(e)}. Make sure Ollama is running at {self.base_url}")

            if resp.status_code != 200:
                raise RuntimeError(f"Ollama error ({resp.status_code}): {resp.text}")

            data = resp.json()
            msg = data.get("message", {})
            content = msg.get("content", "")
            tool_calls = []
            if "tool_calls" in msg and msg["tool_calls"]:
                for tc in msg["tool_calls"]:
                    fn = tc.get("function", {})
                    tool_calls.append({
                        "name": fn.get("name"),
                        "arguments": fn.get("arguments", {})
                    })

            return {
                "content": content,
                "tool_calls": tool_calls,
                "raw": data
            }

