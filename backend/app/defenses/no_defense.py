from typing import Dict, Any, Tuple
from app.defenses.base import BaseDefense

class NoDefense(BaseDefense):
    """
    Baseline: Pass tool outputs directly to the agent without additional protection.
    """
    def __init__(self):
        super().__init__(name="no_defense")

    async def process_input(
        self,
        system_prompt: str,
        user_task: str,
        tool_output: str,
        ground_truth_malicious: bool = False,
        ground_truth_category: str = "benign"
    ) -> Tuple[str, str, Dict[str, Any]]:
        metadata = {
            "defense": "no_defense",
            "modified_system_prompt": False,
            "modified_tool_output": False,
            "blocked": False
        }
        return system_prompt, tool_output, metadata

