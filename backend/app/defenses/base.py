from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple

class BaseDefense(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    async def process_input(
        self,
        system_prompt: str,
        user_task: str,
        tool_output: str,
        ground_truth_malicious: bool = False,
        ground_truth_category: str = "benign"
    ) -> Tuple[str, str, Dict[str, Any]]:
        """
        Processes input before passing to target agent.
        Returns:
            (augmented_system_prompt, filtered_tool_output, defense_metadata)
        """
        pass

