from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseLLMProvider(ABC):
    def __init__(self, api_key: str = "", model: str = ""):
        self.api_key = api_key
        self.model = model

    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """
        Generate response from model.
        Returns:
        {
            "content": str,
            "tool_calls": [
                {"name": "tool_name", "arguments": {"arg1": "val1"}}
            ],
            "raw": Any
        }
        """
        pass

