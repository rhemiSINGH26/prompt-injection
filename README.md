# ACIB: Adaptive Code-mixed Indic Benchmark for Task-Specific Tool-Using Agents

> **Research Platform Implementation** based on the IEEE paper:  
> *"Beyond Static Suites: Adaptive, Code-Mixed Indic Prompt Injection Benchmark for Task-Specific Tool-Using Agents"*

---

## 1. Project Overview & Research Contributions

**ACIB (Adaptive Code-mixed Indic Benchmark)** is an end-to-end evaluation platform designed to assess the resilience of tool-using Large Language Model (LLM) agents against **indirect prompt injection attacks**. 

Unlike conventional static evaluation suites, ACIB introduces three primary innovations:

1. **Multilingual & Code-Mixed Indic Vulnerability Surface:**
   - Evaluates **English**, **Hinglish** (Hindi + English), and **Tamil-English** (Tanglish) across three attack classes:
     - **Goal Hijacking:** Diverting the agent to execute unauthorized attacker tools (e.g. exfiltration via simulated email or arbitrary file modifications).
     - **Prompt Leakage:** Exfiltrating internal system prompts, developer rules, and hidden API secrets.
     - **Denial of Service (DoS):** Forcing agent loops, crash traps, or persistent refusal of legitimate user tasks.

2. **Adaptive Red-Team Loop (Iterative Multi-Round Rewriting):**
   - Implements a dynamic feedback loop (up to 3 rounds). If an attack is repelled in Round 1, the Red-Team LLM inspects the target agent's defense refusal and adaptively mutates the attack (using syntactic shifts, code-mixed framing, authority pretext, and delimiter bypassing) while preserving the exact malicious objective and language variety.

3. **Security-Utility Score (SUS) Engine:**
   - Evaluates both defensive resistance $S(t)$ and legitimate task completion utility $U(t)$ rather than evaluating security in isolation:
     $$\text{SUS} = \frac{1}{|T|} \sum_{t \in T} \left[ \alpha \cdot S(t) + (1 - \alpha) \cdot U(t) \right]$$
     *(Supported user-configurable $\alpha \in \{0.3, 0.5, 0.7\}$, default $\alpha = 0.5$)*.

4. **Rigorous Defense Implementations:**
   - **No Defense (Baseline):** Raw indirect tool data ingested directly.
   - **Prompt-Level Defense:** System-level instruction declaring all tool output untrusted.
   - **Guardrail Model:** Pre-execution classifier identifying injection categories with configurable threshold ($\tau$), tracking True Positives (TP), False Positives (FP), True Negatives (TN), and False Negatives (FN).
   - **Privilege Separation (Dual-Context):** Structural data encapsulation (`<UNTRUSTED_EXTERNAL_DATA>`) paired with a programmatic **Policy Enforcement Layer** that halts sensitive tool calls (email dispatch, file writes, calendar appointments) originating from untrusted data.

---

## 2. System Architecture

```
                          ┌──────────────────────────────────────────────┐
                          │            Trusted User Instruction          │
                          └──────────────────────┬───────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────┐          ┌───────────────────────┐
│ External Simulated Data │          │   Target LLM Agent    │
│ (Indirect Injections)   ├─────────►│  Tool-Execution Loop  │
└────────────┬────────────┘          └───────────┬───────────┘
             │                                   │
             ▼                                   ▼
┌─────────────────────────┐          ┌───────────────────────┐
│  Active Defense Layer   │          │ Sandboxed Mock Tools  │
│ - Prompt Defense        │          │ - search              │
│ - Guardrail Classifier  │          │ - file_read           │
│ - Privilege Separation  │          │ - file_write          │
└────────────┬────────────┘          │ - email_send          │
             │                       │ - calendar_event      │
             ▼                       └───────────┬───────────┘
┌─────────────────────────┐                      │
│  Outcome Evaluator      │                      │
│  (Attack vs Defense)    │◄─────────────────────┘
└────────────┬────────────┘
             │
     [If Attack Fails]
             │
             ▼
┌─────────────────────────┐
│  Adaptive Red-Team LLM  │
│  (Rounds 1 -> 2 -> 3)   │
└─────────────────────────┘
```

---

## 3. Technology Stack

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 (SQLite local with Postgres-ready ORM), Pydantic v2, ReportLab (PDF generator), HTTPX.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **LLM Integrations:**
  - **Deterministic Mock Provider:** Included out of the box for zero-API reproducible benchmarking and automated testing.
  - **OpenAI API:** Direct chat completions and tool-calling (`gpt-4o`, `gpt-4o-mini`).
  - **Google Gemini API:** `gemini-1.5-flash`, `gemini-1.5-pro`.
  - **Ollama:** Local models (`llama3`, `mistral`).

---

## 4. Project Directory Structure

```
d:\Prompt Injection\
├── backend/
│   ├── app/
│   │   ├── agent/                 # Target Agent & Sandboxed Mock Tools
│   │   │   ├── tools.py           # Sandboxed file, email, calendar, search tools
│   │   │   ├── target_agent.py    # Autonomous tool-using agent execution engine
│   │   │   └── privilege_separator.py # Dual-context policy enforcement layer
│   │   ├── benchmark/             # Benchmark Execution & Metrics
│   │   │   ├── metrics.py         # SUS, ASR@1/2/3, FPR, and breakdown calculations
│   │   │   └── runner.py          # Background experiment execution & live polling
│   │   ├── datasets/              # Dataset Corpus
│   │   │   ├── starter_dataset.json # Curated English, Hinglish, Tamil-English dataset
│   │   │   └── loader.py          # Seeder, CSV/JSON importer & exporter, LLM generator
│   │   ├── defenses/              # 4 Concrete Defense Configurations
│   │   │   ├── base.py
│   │   │   ├── no_defense.py
│   │   │   ├── prompt_defense.py
│   │   │   ├── guardrail.py       # Classifier with confidence threshold & confusion matrix
│   │   │   └── privilege_defense.py # Programmatic privilege separation
│   │   ├── llm/                   # Multi-Provider LLM Abstraction
│   │   │   ├── base.py
│   │   │   ├── mock_provider.py   # Deterministic academic mock LLM engine
│   │   │   ├── openai_provider.py
│   │   │   ├── gemini_provider.py
│   │   │   └── ollama_provider.py
│   │   ├── models/                # SQLAlchemy ORM Models (Experiments, Rounds, Examples)
│   │   ├── schemas/               # Pydantic v2 Request/Response Schemas
│   │   ├── reports/               # Research PDF & CSV Report Exporter
│   │   ├── config.py              # Environment settings
│   │   ├── database.py            # SQLAlchemy engine & session factory
│   │   └── main.py                # FastAPI endpoints, CORS, static SPA routing
│   ├── tests/                     # Automated Test Suite (13 comprehensive tests)
│   │   ├── test_all_core_modules.py
│   │   └── test_api.py
│   ├── sandbox/                   # Sandboxed file workspace
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.ts          # Axios API communication service
│   │   ├── components/            # Sidebar, Navbar, Badges
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx            # Executive cybersecurity research dashboard
│   │   │   ├── DatasetManagement.tsx    # Dataset explorer, search, filter, export, synth gen
│   │   │   ├── TargetAgentPage.tsx      # Module C interactive tool-agent testing
│   │   │   ├── DefenseConfigPage.tsx    # Module D 4-defense comparative tester
│   │   │   ├── AdaptiveRedTeamPage.tsx  # Module 4 interactive 3-round adaptive loop
│   │   │   ├── ExperimentRunnerPage.tsx # Benchmark launcher with real-time progress
│   │   │   ├── ResultsAnalyticsPage.tsx # Tables 1–6, CSV, JSON, PDF export
│   │   │   └── SettingsPage.tsx         # API keys & benchmark calibration
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── run_app.py                     # Unified root launcher
├── .env.example
└── README.md
```

---

## 5. Quick Start Instructions

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ (Node 22 recommended)

### Step 1: Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 2: Install Frontend Dependencies & Build SPA
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 3: Run the Application
You can run the unified server (serves both API and UI):
```bash
python run_app.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

*(Optional Development Mode: You can also run the Vite dev server with hot reload)*:
```bash
# Terminal 1: Backend
python backend/run_backend.py

# Terminal 2: Frontend
cd frontend
npm run dev
# Open http://localhost:3000
```

---

## 6. Running the Automated Test Suite

ACIB includes automated tests covering dataset filtering, agent sandboxed tool execution, all 4 defenses, adaptive multi-round rewriting, SUS calculations, and API endpoints:

```bash
pytest backend/tests -v
```

Expected result:
```
======================= 13 passed in ~2.5s =======================
```

---

## 7. Demonstration Experiment & Verification Walkthrough

Follow this step-by-step walkthrough to reproduce the benchmark:

1. **Open Dashboard:** Navigate to `http://localhost:8000/`.
2. **Launch Quick Test:**
   - Click **"Launch Quick Test"** in the top navigation or navigate to **Experiment Runner**.
   - Select **Mode: Quick Test**.
   - Provider: **Mock Engine** (Deterministic, no API key needed) or select **OpenAI** / **Gemini** in Settings.
   - Defense: **All 4 Defenses (Compare)**.
   - Adaptive Rounds: **3 Rounds**.
   - Click **"Launch Benchmark Execution"**.
3. **Observe Real-Time Execution:**
   - Watch the progress bar increment in real time.
   - Observe the live test case counter, current language variety (English, Hinglish, Tamil-English), and active defense.
   - Note the live counts of successful vs blocked injections.
4. **Inspect Adaptive Evolution:**
   - Once completed, click **"Inspect"** or navigate to **Results & Analytics**.
   - Review **TABLE 1** (ASR by Defense), **TABLE 2** (ASR by Language), **TABLE 3** (Guardrail rates), **TABLE 4** (SUS scores), **TABLE 5** (Attack categories), and **TABLE 6** (Adaptive progression ASR@1 $\to$ ASR@2 $\to$ ASR@3).
   - Expand individual injection logs to inspect how Round 1 failed, how the Red-Team model rephrased the attack in Round 2, and the resulting target behavior.
5. **Export Research Artifacts:**
   - Click **"Download Research PDF"** to generate an academic PDF report.
   - Click **"Export CSV"** for experimental raw data records.
6. **Interactive Modules:**
   - Try **Target Agent**: Test direct prompts and witness sandboxed tool calls (`file_read`, `email_send`).
   - Try **Defense Configuration**: Test a single injection across all 4 defenses simultaneously.
   - Try **Adaptive Red Team**: Submit custom Hinglish or Tanglish prompts and observe live 3-round mutations.

---

## 8. License & Academic Attribution
Developed as an open academic benchmark framework implementing the methodology described in:
*"Beyond Static Suites: Adaptive, Code-Mixed Indic Prompt Injection Benchmark for Task-Specific Tool-Using Agents"*.

