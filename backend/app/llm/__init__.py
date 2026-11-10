from app.llm.base import BaseLLMProvider
from app.llm.mock_provider import MockLLMProvider
from app.llm.openai_provider import OpenAIProvider
from app.llm.gemini_provider import GeminiProvider
from app.llm.ollama_provider import OllamaProvider
from app.config import settings

def get_llm_provider(
    provider_name: str = "mock",
    api_key: str = "",
    model: str = ""
) -> BaseLLMProvider:
    provider = (provider_name or settings.default_provider).lower()
    
    if provider == "openai":
        key = api_key or settings.openai_api_key
        return OpenAIProvider(api_key=key, model=model or settings.default_target_model)
    elif provider == "gemini":
        key = api_key or settings.gemini_api_key
        return GeminiProvider(api_key=key, model=model or "gemini-1.5-flash")
    elif provider == "ollama":
        return OllamaProvider(model=model or "llama3:latest")
    else:
        # Default mock provider for deterministic reproducible benchmark
        return MockLLMProvider(model=model or "mock-model")

__all__ = [
    "BaseLLMProvider",
    "MockLLMProvider",
    "OpenAIProvider",
    "GeminiProvider",
    "OllamaProvider",
    "get_llm_provider"
]

