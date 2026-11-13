# ACIB Architecture Reference & Sample Code Modules

This directory contains standalone, self-contained reference implementations for each core architectural component of the **ACIB (Adaptive Code-mixed Indic Benchmark)** framework.

Each sample script can be executed independently from the command line without external dependencies.

---

## Architecture Blueprint

```
                                  ┌──────────────────────────────┐
                                  │    Trusted User Instruction  │
                                  └──────────────┬───────────────┘
                                                 │
                                                 ▼
┌───────────────────────────────┐     ┌──────────────────────────────┐
│  Untrusted External Stream    │     │      Target Agent Loop       │
│  (Indirect Prompt Injections) │────►│  (01_target_agent_and_tools) │
└───────────────┬───────────────┘     └──────────────┬───────────────┘
                │                                    │
                ▼                                    ▼
┌───────────────────────────────┐     ┌──────────────────────────────┐
│     Active Defenses Layer     │     │      Sandboxed Tools         │
│  (02_defenses_comparison)     │     │  - search                    │
│  • Prompt-Level Defense       │     │  - file_read                 │
│  • Guardrail Classifier       │     │  - file_write                │
│  • Privilege Separation       │     │  - email_send                │
│    (06_dual_context_policy)   │     │  - calendar_event            │
└───────────────┬───────────────┘     └──────────────┬───────────────┘
                │                                    │
                └─────────────────┬──────────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────────┐
                     │       Outcome Evaluator      │
                     │  (Compromised vs Defended)   │
                     └────────────┬─────────────────┘
                                  │
                          [If Attack Fails]
                                  │
                                  ▼
                     ┌──────────────────────────────┐
                     │   Adaptive Red-Team Loop     │
                     │  (03_adaptive_red_team_loop) │
                     │  Rounds 1 -> 2 -> 3          │
                     └────────────┬─────────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────────┐
                     │       SUS & Metrics Engine   │
                     │ (04_security_utility_score)  │
                     │ ASR@k, SUS, FPR, Block Rates │
                     └──────────────────────────────┘
```

---

## Directory Modules & Execution Commands

### 1. Target Agent & Sandboxed Mock Tools
- **File:** `01_target_agent_and_tools.py`
- **Purpose:** Demonstrates autonomous tool execution (`search`, `file_read`, `file_write`, `email_send`, `calendar_event`) and how the agent responds to indirect prompt injection embedded in external data.
- **Run command:**
  ```bash
  python architecture/01_target_agent_and_tools.py
  ```

---

### 2. Four Comparative Defenses
- **File:** `02_defenses_comparison.py`
- **Purpose:** Demonstrates the 4 defense configurations on the exact same code-mixed prompt:
  1. *No Defense* (Baseline concatenation)
  2. *Prompt-Level Defense* (System directive)
  3. *Guardrail Model* (Pre-execution classifier with threshold & sanitization)
  4. *Privilege Separation* (Dual-Context + Policy Enforcement)
- **Run command:**
  ```bash
  python architecture/02_defenses_comparison.py
  ```

---

### 3. Adaptive Red-Team Loop (Rounds 1–3)
- **File:** `03_adaptive_red_team_loop.py`
- **Purpose:** The core research contribution. Demonstrates the iterative adversarial loop where failed attacks trigger Red-Team LLM reflection and payload rewrites across Rounds 1, 2, and 3, preserving the attack category and language variety.
- **Run command:**
  ```bash
  python architecture/03_adaptive_red_team_loop.py
  ```

---

### 4. Security-Utility Score (SUS) & Metrics Engine
- **File:** `04_security_utility_score_sus.py`
- **Purpose:** Exact implementation of the IEEE paper's mathematical formulation:
  $$\text{SUS} = \frac{1}{|T|} \sum_{t \in T} \left[ \alpha \cdot S(t) + (1 - \alpha) \cdot U(t) \right]$$
  Computes $ASR@1$, $ASR@2$, $ASR@3$, $FPR$, Guardrail Block Rate, and Guardrail Bypass Rate.
- **Run command:**
  ```bash
  python architecture/04_security_utility_score_sus.py
  ```

---

### 5. Multilingual Code-Mixed Dataset Schema
- **File:** `05_multilingual_code_mixed_dataset.py`
- **Purpose:** Demonstrates the dataset structure and query filtering across English, Hinglish, and Tamil-English over Goal Hijacking, Prompt Leakage, and DoS attack classes.
- **Run command:**
  ```bash
  python architecture/05_multilingual_code_mixed_dataset.py
  ```

---

### 6. Dual-Context Privilege Separation Architecture
- **File:** `06_dual_context_policy_enforcement.py`
- **Purpose:** Deep dive into the most resilient defense in ACIB. Shows structural encapsulation (`<UNTRUSTED_EXTERNAL_DATA>`) and the programmatic `PolicyEnforcementLayer` that blocks exfiltration calls without relying solely on model prompt adherence.
- **Run command:**
  ```bash
  python architecture/06_dual_context_policy_enforcement.py
  ```
