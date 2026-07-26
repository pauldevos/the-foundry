# Ingestion & Parsing — Tools Survey

*Filled in 2026-07-26 (was queued since Queue C1), extended same day to add PyMuPDF,
LlamaParse as its own entry, and Audio/Video ingestion. Organized by job-category — "which
category does this tool belong to" is the useful question, not an A-Z list. Every category
is a table: what the tool does, Cloud vs. Local, and the verdict — when you'd reach for it.
See `../../ai-engineering-decision-matrix.md` section 1 for the IF/THEN version of this
same categorization.*

---

## 1. Classic / rule-based OCR engines
*Pure character recognition from pixels — template-matching against printed glyphs, no
language understanding. Fails on handwriting and tally marks — no consistent template.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **Tesseract** | Free, open-source, the longest-established OCR engine | Local | Fine for high-volume simple typed text; mangles tables and non-standard layouts |
| **PaddleOCR** (or its faster wrapper **RapidOCR**) | Open-source OCR with an optional layout/table module (PPStructureV3) | Local | Better all-around free option than Tesseract once layout complexity exists |
| **EasyOCR** | Open-source OCR, broad language support out of the box | Local | Good default when multilingual coverage matters more than table handling |

## 2. Cloud managed document-intelligence services
*OCR plus structure — tables, form fields, key-value pairs, bounding boxes.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **AWS Textract** | Managed OCR + table/form structure extraction, pay-per-page | Cloud | Worth the cost for regulated or table-heavy documents |
| **Azure AI Document Intelligence** | Managed OCR + structure, with a *distinct* handwriting-recognition mode separate from standard OCR | Cloud | Natural default in an Azure-first shop; handwriting mode closes the classic-OCR gap |
| **Google Document AI** | Managed OCR + prebuilt specialized processors (invoices, receipts, ID docs) | Cloud | Best when document types match a Google prebuilt processor closely |

## 3. Modern VLM-based dedicated OCR models (open-source, self-hostable)
*Treats reading as generation rather than detect-then-recognize — better than classic OCR
on messy/complex layouts, while still narrowly OCR-focused.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **GOT-OCR2.0** | Generates text directly from visual features; also handles sheet music and formulas | Local | Strong general-purpose modern open OCR, not tied to academic content |
| **Nougat** | Purpose-built for academic papers (LaTeX/math-heavy content) | Local | Right choice specifically for scientific/technical papers with heavy notation |
| **RolmOCR** | Reducto AI's fine-tune of Qwen2.5-VL-7B on Allen AI's olmOCR dataset; ~92% accuracy on mixed-script docs vs. Tesseract's ~78% | Local | Strong on tables/multi-column, practical for GPU-constrained or local deployment |

## 4. Document-parsing orchestration frameworks
*Not a raw OCR model — wraps OCR/layout-detection/table-extraction into one pipeline
outputting clean markdown or structured data.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **Docling** (IBM) | Parses to clean markdown; particularly strong on digital-born PDFs with simple layout | Local | Good default for a mostly-digital, moderately-structured corpus |
| **Unstructured.io** | Broad file-type support (PDF, DOCX, HTML, images, email) | Both — open-source library + managed API option | Good when the corpus mixes many file types under one framework |
| **MinerU** | Strong on complex scientific/technical PDF layouts | Local | Alternative to Docling when layouts are more complex than Docling handles well |
| **LlamaParse** | LlamaIndex's managed document-parsing API | Cloud | *Paul tested directly — inferior to a Sonnet + Mistral OCR combination, especially on complex clinical table structures. Not recommended for production healthcare/complex-layout PDFs.* |

## 5. Dedicated table/layout structure detectors
*Narrow scope — finding and structuring tables specifically, not general text extraction.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **Table Transformer** (Microsoft) | Detection-transformer model for table structure recognition | Local | Use as a component when table structure fidelity is the specific bottleneck |
| **PPStructureV3** | PaddleOCR's layout + table detection module | Local | Convenient if already using PaddleOCR for the OCR layer |
| **Camelot** | Python library, extracts tables from digital PDFs (not scans) | Local | Simplest option when tables are already in a digital PDF |
| **img2table** | Python library, table extraction from images *and* PDFs | Local | Alternative to Camelot when the source may be scanned, not just digital |

## 6. General-purpose multimodal / vision-language models
*Not OCR-specific — read text in images *and* reason about visual context/meaning, so they
infer characters from context rather than template-matching. Handles handwriting and tally
marks well for exactly that reason.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **Claude (Sonnet/Opus, vision)** | General multimodal reasoning + vision | Cloud (API) | Paul's established default — the Sonnet + Mistral OCR combination beat LlamaParse |
| **GPT-4o / GPT-5 (vision)** | General multimodal reasoning + vision | Cloud (API) | Comparable general-purpose vision capability |
| **Gemini (vision)** | General multimodal reasoning + vision, notably large context windows | Cloud (API) | Large context good for multi-page documents in a single call |

## 7. Frontier-lab dedicated OCR products
*A model specifically shipped as an OCR product, not general chat.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **Mistral OCR** | Dedicated OCR product, ~90% accuracy on clean printed docs per current benchmarks | Cloud (API) | Strong on clean printed text; weaker on multilingual/tables/low-quality scans — pair with a table tool or a general VLM for anything more complex |

## 8. Pure digital-PDF libraries (no OCR involved at all)
*Only works when the source already has a real embedded text layer — see the "skip OCR
entirely" rule in the decision matrix.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **PyMuPDF** | Fast, free, direct text/layout extraction from digital-native PDFs | Local | Paul's default for clean digital PDFs — fast and free, but only works when a real text layer exists; running it on a scan returns nothing |
| **pdfplumber** | Python library, extracts text/tables directly from digital PDFs | Local | Alternative to PyMuPDF, more table-extraction-focused |

---

## 9. Audio Ingestion
*Almost always the same pattern regardless of provider: transcribe to text first, then
treat it as a normal document for chunking/embedding/retrieval — this repo's own
`youtube-research-pipeline` sibling works exactly this way.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **Whisper** (OpenAI) | Speech-to-text transcription | Both — open-source local model + OpenAI's hosted API | The standard; this is the transcript-first pattern almost every pipeline actually uses |
| **AssemblyAI** | Managed transcription with speaker diarization, sentiment, and other analysis built in | Cloud | Alternative when you need more than a raw transcript out of the box |
| **Deepgram** | Managed, low-latency transcription | Cloud | Alternative when real-time/low-latency transcription matters |
| **Azure / Google Speech-to-Text** | Managed transcription tied into an existing cloud stack | Cloud | Natural default if already Azure/GCP-native |

## 10. Video Ingestion
*Two real approaches: native video+audio understanding in one model call (Gemini, the one
frontier model that genuinely does this at the API level), or the DIY combination —
extract the audio track for transcription and separately sample frames for a vision model.
For most enterprise document-RAG use cases, the transcript alone is what actually gets
retrieved; frame-level visual understanding is for when the visual content itself is the
answer (a diagram in a recorded lecture, a play-by-play in game footage).*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **Gemini** (native video understanding) | Samples frames (~1fps, motion-adaptive) *and* separates the audio track for speech-to-text, natively in one API call | Cloud (API) | The one frontier model with real native video+audio understanding, not just consumer chat — reach for this when both the visuals and the audio matter together |
| **GPT-4o** (video via frame snapshots) | More limited, snapshot-based video comprehension vs. Gemini's continuous approach | Cloud (API) | Workable but meaningfully less capable than Gemini specifically for video |
| **Twelve Labs** | Dedicated video-AI platform — video-native embeddings, semantic video search | Cloud (API) | Purpose-built when the task *is* video search/understanding itself, not just extracting a transcript |
| **DIY: extract audio → Whisper + sample frames → vision model** | Combine tools 9 and 6 above yourself | Both | The most universal, provider-agnostic approach — works today regardless of which frontier model you use downstream, and is what most transcript-based pipelines (including this repo's YouTube pipeline) actually do |

*[Personal: this is directly relevant to the mediaguide-langgraph/gamebook-langgraph
portfolio projects — game footage and broadcast audio are exactly this ingestion problem.]*
