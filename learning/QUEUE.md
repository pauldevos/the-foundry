# Processing Queue

Working state for the learning-deck build-out. Two separate queues — don't conflate them.

---

## Queue A — Not yet pulled (blocked by YouTube IP rate-limit)

Retry these first thing next session; if still blocked, wait longer before retrying again
(don't hammer it — got us blocked in the first place).

| Video ID | Category | URL |
|---|---|---|
| `aHCDrAbH_go` | LangGraph | https://www.youtube.com/watch?v=aHCDrAbH_go |
| `1OLrT3dEzhA` | Agentic Patterns | https://www.youtube.com/watch?v=1OLrT3dEzhA |
| `y32PywFi7Ek` | CI/CD for AI | https://www.youtube.com/watch?v=y32PywFi7Ek |
| `vj68el9hRvU` | CI/CD for AI | https://www.youtube.com/watch?v=vj68el9hRvU |
| `C842vFY5kRo` | System Design | https://www.youtube.com/watch?v=C842vFY5kRo |
| `rSKh6bVuVZI` | (unidentified — pull title once unblocked) | https://www.youtube.com/watch?v=rSKh6bVuVZI |
| `jWy39wavbjY` | (unidentified — pull title once unblocked) | https://www.youtube.com/watch?v=jWy39wavbjY |

Last confirmed still blocked: this session, two separate checks (different videos), both `IpBlocked`.

---

## Queue B — Transcripts saved, not yet turned into notes + cards

These are safe on disk in `transcripts/` already — no re-pull needed, no blocking risk.
Just need the same treatment CME295 L7/L8 got: read transcript → write study notes
(20-30 points) → write a card deck (aim 15-50 cards depending on depth of source).

**CME 295 — rest of the course** (L1, L6, L7, L8 done):
| Video ID | Lecture | Topic (from transcript intro) |
|---|---|---|
| `yT84Y5zCnaA` | L2 | continuation of Transformer architecture |
| `Q5baLehv5So` | L3 | "finally introduce large language models" |
| `VlA_jt_3Qc4` | L4 | pre-midterm content |
| `PmW_TMQ3l0I` | L5 | post-midterm content |
| ~~`k5Fh-UgTuCo`~~ | ~~L6~~ | ✅ done — GRPO, verifiable rewards, pass@k |
| `Q86qzJ1K1Ss` | L9 | final lecture, special format |

**Evals batch (12 videos)** — titles confirmed via oEmbed:
| Video ID | Title |
|---|---|
| `t6r4U0SlnPc` | How to Process Documents at Scale with LLMs |
| `jkon5HsAq30` | Product Discovery Meets AI Evals with Teresa Torres |
| `qH1dZ8JLLdU` | Intro To Error Analysis: Creating Custom Data Annotation Apps |
| `LwLxlEwrtRA` | The Evals That Made GitHub Copilot |
| `7kXY-2fYdHI` | Graph Databases: When to Use Them (And When to Run Away) |
| `DgPr3HVp0eg` | SolveIt: The Thinking Developer's Environment w/ Jeremy Howard & Johno Whitaker |
| `aqKUwPKBkB0` | Build Your Own Eval Tools With Notebooks! |
| ~~`_UY49Q_qFhs`~~ | ✅ done — Inspect eval framework (JJ Allaire) |
| `GL0XhAj5LPE` | LLM Evals: Common Mistakes |
| `SnbGD677_u0` | Instrumenting & Evaluating LLMs |
| `0pnEUAwoDP0` | How to Build, Evaluate, and Iterate on LLM Agents |
| `Xfl50508LZM` | Ship Real Agents: Hands-On Evals for Agentic Applications — Laurie Voss, Arize |

**RAG:**
| Video ID | Title |
|---|---|
| `sVcwVQRHIc8` | Learn RAG From Scratch — Python AI Tutorial from a LangChain Engineer |

**Others:**
| Video ID | Title |
|---|---|
| `ib-wTAvCZqg` | Architecting and Testing Controllable Agents — Lance Martin |
| `kkL_y5t1jo4` | The LangChain Team Answers the Most Searched Questions About Agents |
| `agSRMrhNTf4` | Why Enterprise AI Adoption Is Slower Than You Think — Aaron Levie (Box) + Harrison Chase |
| `uCKhOmth2ms` | The best AI agents are simpler than you think |

**Suggested processing order** (Document AI heavy areas first, per Paul's stated priority):
1. CME295 L6 (reasoning) — rounds out the CME295 architecture sequence
2. Evals batch — especially Inspect, GitHub Copilot evals, and the agent-evals videos (Xfl50508LZM, 0pnEUAwoDP0)
3. Agent/adoption others — especially Lance Martin (controllable agents) and the LangChain agent Q&A
4. RAG-from-scratch tutorial
5. Remaining CME295 lectures (L2-L5, L9) in course order

---

*Update this file as items move between queues or get completed — don't just re-derive
it from conversation memory next time.*
