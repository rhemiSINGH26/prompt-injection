from app.defenses.base import BaseDefense
from app.defenses.no_defense import NoDefense
from app.defenses.prompt_defense import PromptLevelDefense
from app.defenses.guardrail import GuardrailClassifier
from app.defenses.privilege_defense import PrivilegeSeparationDefense

def get_defense(name: str, guardrail_llm=None, threshold: float = 0.65) -> BaseDefense:
    norm_name = name.lower().replace("-", "_")
    if norm_name == "prompt_defense" or norm_name == "prompt_level":
        return PromptLevelDefense()
    elif norm_name == "guardrail":
        return GuardrailClassifier(classifier_llm=guardrail_llm, threshold=threshold)
    elif norm_name == "privilege_separation" or norm_name == "privilege":
        return PrivilegeSeparationDefense()
    else:
        return NoDefense()

__all__ = [
    "BaseDefense",
    "NoDefense",
    "PromptLevelDefense",
    "GuardrailClassifier",
    "PrivilegeSeparationDefense",
    "get_defense"
]

