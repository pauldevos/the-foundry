# Ingestion & Parsing — Tools Survey

*Filled in 2026-07-26 (was queued since Queue C1), extended same day to add PyMuPDF,
LlamaParse as its own entry, and Audio/Video ingestion. Extended 2026-08-06 with real
findings from Paul's `media_guide_parser` project (preprocessing, DocTR, layout-detector
benchmarks) and an independent OCR-tool comparison from
[r/LocalLLaMA](https://www.reddit.com/r/LocalLLaMA/comments/1ralqm0/i_benchmarked_paddleocrvl_15_vs_marker_vs/)
(PaddleOCR-VL 1.5 vs. Marker vs. PP-StructureV3, pasted directly, Jan 2026). Organized by
job-category — "which category does this tool belong to" is the useful question, not an
A-Z list. Every category is a table: what the tool does, Cloud vs. Local, and the verdict —
when you'd reach for it. See `../../ai-engineering-decision-matrix.md` section 1 for the
IF/THEN version of this same categorization, and `ocr-tool-deep-dive.md` for a deeper,
differently-sliced view of most of these same tools — architecture class/training data,
install/license/Java-dependency profile, and fine-tuning feasibility, each as its own table.*

---

## 0. Preprocessing — before OCR ever runs
*Not an OCR technique itself — the image-cleanup pass that determines how well any of the
techniques below actually perform. Skewed/rotated scans, wrong pixel dimensions for a
model's input limits, and color mode (grayscale vs. RGB) are a bigger accuracy lever than
people expect, because every technique below assumes roughly upright, correctly-scaled
input.*

| Step | What it does | Why it matters |
|---|---|---|
| **Deskew (Hough transform)** | Detects the dominant line angle in a scanned page and rotates it back to upright before OCR runs | A crooked phone-photographed or badly-fed scan degrades every downstream technique equally — classic OCR, VLM, and layout detectors all assume roughly upright input |
| **Sharpen + letterbox to a fixed target size** | Normalizes every page to one consistent resolution (e.g. 1400×1600) regardless of source scan quality | Keeps OCR/layout models operating in the resolution range they were actually benchmarked at, instead of silently degrading on oddly-sized inputs |
| **Resize for a model's max input size** | Downscales the longest edge to a specific pixel cap (e.g. 1040px) before sending to a VLM | Cloud OCR APIs and local VLMs both have hard input-size limits — an unresized image either gets silently downscaled by the API in a way you don't control, or blows past a local model's practical memory/speed budget |
| **Grayscale vs. color** | Whether to strip color before OCR | Cheap accuracy lever for plain text pages; a real cost on documents where color itself is meaningful (highlighted fields, color-coded table rows) |

*[Personal: this is real production code from `media_guide_parser`
(`~/github/football/media_guide_parser`, notebooks/00_preprocess_pages.ipynb) — deskew via
Hough transform, sharpen, letterbox to 1400×1600, all before any OCR engine sees the page.
Separately, `notebooks/model_eval/` caps images at `max_side_px=1040` before RolmOCR and
benchmarks a `resize(w//2, h//2)` "~100 DPI equivalent" step — i.e. actively trading
resolution against model speed/memory limits, not just fixing skew. Notable: this whole
preprocessing stage got *cut* in a later architecture rewrite once extraction moved to a
vision-LLM reading the raw rendered page directly instead of an OCR-to-text pipeline — see
the closing note at the bottom of this file.]*

## 1. Classic / rule-based OCR engines
*Pure character recognition from pixels — template-matching against printed glyphs, no
language understanding. Fails on handwriting and tally marks — no consistent template.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **Tesseract** | Free, open-source, the longest-established OCR engine | Local | Fine for high-volume simple typed text; mangles tables and non-standard layouts |
| **PaddleOCR** (or its faster wrapper **RapidOCR**) | Open-source OCR with an optional layout/table module (PPStructureV3) | Local | Better all-around free option than Tesseract once layout complexity exists. *Paul's verdict after direct use: capable, but would not choose it again by preference — the PaddlePaddle/PaddleOCR/PPStructureV3 install chain was genuinely painful. Not just a personal gripe: PaddlePaddle's GitHub issues independently confirm recurring dependency conflicts (GPU CUDA/cuDNN version pins, Python 3.12+ setuptools breakage, install timeouts on the large PaddlePaddle download), a known rough edge across the ecosystem, not this project's environment specifically. Worth knowing well since it's a widely-referenced default — just budget real setup time, or reach for RapidOCR's ONNX build specifically to sidestep the PaddlePaddle dependency entirely.* |
| **EasyOCR** | Open-source OCR, broad language support out of the box | Local | Good default when multilingual coverage matters more than table handling |
| **DocTR** (Mindee) | Two-stage text detection + transformer-based recognition, full-page OCR | Local | *Paul benchmarked directly against PaddleOCR/RapidOCR on real media-guide scans — same general job as PaddleOCR, different architecture; see `media_guide_parser` note in category 3 below.* |

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
| **RolmOCR** | Reducto AI's fine-tune of Qwen2.5-VL-7B on Allen AI's olmOCR dataset; ~92% accuracy on mixed-script docs vs. Tesseract's ~78% | Local | Strong on tables/multi-column, practical for GPU-constrained or local deployment. *Paul tested directly on `media_guide_parser` — 200–400s/page on an M1 32GB via transformers/MPS. Lost to Mistral OCR (below) on both speed and quality on that hardware; see `notebooks/model_eval/MODEL_RESEARCH.md`.* |
| **PaddleOCR-VL 1.5** | 0.9B autoregressive VLM, generates document elements one at a time rather than detect-then-recognize | Local / Cloud (GPU rental) | **Two contradictory data points, both real — worth knowing both.** Vendor benchmark (OmniDocBench v1.5): claims 94.5% accuracy, state-of-the-art, beating GPT-4o and Gemini 2.5 Pro. Independent real-world test (r/LocalLLaMA, Jan 2026, "Attention Is All You Need" 15-page paper on Modal GPUs): slowest of 3 tools tested (7 min/doc on a T4, 5.3 min on A10G — vs. under a minute for the alternatives below), worst quality, and by far the worst setup experience (PaddlePaddle requires a non-PyPI mirror install, segfaults on CPU during containerized builds, breaks on numpy≥2.0, silent crashes with unhelpful errors — "hours of debugging" per the reporter). The gap between "wins the standardized benchmark" and "worst in a real pipeline" is the lesson, not either number alone — standardized-benchmark accuracy and practical deployability are different axes, and this is about as clean a real example as exists. |

## 4. Document-parsing orchestration frameworks
*Not a raw OCR model — wraps OCR/layout-detection/table-extraction into one pipeline
outputting clean markdown or structured data.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **Docling** (IBM) | Parses to clean markdown; particularly strong on digital-born PDFs with simple layout | Local | Good default for a mostly-digital, moderately-structured corpus |
| **Unstructured.io** | Broad file-type support (PDF, DOCX, HTML, images, email) | Both — open-source library + managed API option | Good when the corpus mixes many file types under one framework |
| **MinerU** | Strong on complex scientific/technical PDF layouts | Local | Alternative to Docling when layouts are more complex than Docling handles well |
| **LlamaParse** | LlamaIndex's managed document-parsing API | Cloud | *Paul tested directly — inferior to a Sonnet + Mistral OCR combination, especially on complex clinical table structures. Not recommended for production healthcare/complex-layout PDFs.* |
| **Marker** (datalab-to) | PyTorch pipeline built on Surya OCR; PDF → clean Markdown | Local (+ hosted Datalab API option) | Best all-around quality in the r/LocalLLaMA benchmark above: perfect reading order, clean Markdown pipe tables (not raw HTML), captures footnotes/equation numbers/cross-references that PP-StructureV3 dropped. `pip install marker-pdf torch` — "worked on the first try," a sharp contrast to the Paddle install pain elsewhere in this survey. Weakness: inline LaTeX math frequently degrades to unreadable plain text — not the right choice if formula fidelity is the priority (see PP-StructureV3 lightweight below for that case). Hosted version (Datalab API): ~$4/1000 pages, $25/mo free credit — the pragmatic default for occasional use. |
| **PP-StructureV3** (as a full pipeline) | PaddleOCR's own layout+OCR+table+formula pipeline, run as a complete PDF→Markdown converter (not just the table-detection module referenced in category 5) | Local | Strong on math/LaTeX (proper `$...$` wrapping, handles inline notation Marker mangles) and fast in its **lightweight** config specifically — 26–32s for a 15-page paper, the fastest of 3 tools benchmarked, and non-obviously *more* accurate than the heavier default config (which introduced real OCR errors like "English-to-Grman" — bigger model isn't automatically better here). Real dealbreaker found in the same benchmark: jumbles page reading order badly enough to move references/appendix content ahead of the body — a correctness problem, not a polish issue, and disqualifying for anything that needs faithful document order. Same install pain as PaddleOCR-VL above (shared PaddlePaddle dependency chain). |

## 5. Dedicated table/layout structure detectors
*Narrow scope — finding where the tables/regions *are* on a page (a bounding box, not
text), feeding that crop into an OCR engine from the categories above. Two flavors: some
tools here are table-specific, others are general document-layout detectors used as a
pre-crop step before OCR touches the page at all.*

| Tool | What it does | Cloud / Local | Verdict |
|---|---|---|---|
| **Table Transformer** (Microsoft) | Detection-transformer model for table structure recognition | Local | Use as a component when table structure fidelity is the specific bottleneck. *Real benchmark (`media_guide_parser`, IoU vs. known table region): the "lower_right" crop variant scored 0.2797 IoU at 3.5s/page; the naive full-page variant scored 0.0255 IoU — almost never found the table. How you apply a detector matters as much as which one you pick.* |
| **PPStructureV3** | PaddleOCR's layout + table detection module | Local | Convenient if already using PaddleOCR for the OCR layer |
| **Camelot** | Python library, extracts tables from digital PDFs (not scans) | Local | Simplest option when tables are already in a digital PDF |
| **img2table** | Python library, table extraction from images *and* PDFs | Local | Alternative to Camelot when the source may be scanned, not just digital |
| **layout-parser** (layout-parser.github.io) | Detectron2-based general document layout detection toolkit, pretrained on PubLayNet/PRImA/others | Local | A real, well-known tool — worth knowing the name exists. Not confirmed used on any project here (see note below); Paul's own best guess on reflection is that he was actually thinking of PP-DocLayout-S (next row), a Paddle-ecosystem *model*, not this standalone library. |
| **PP-DocLayout-S / PP-DocLayout_plus-L** (Baidu) | A model, not a standalone library — part of PaddleX/PaddleOCR's layout-detection lineup, invoked through the Paddle tooling rather than pip-installed on its own | Local | *Real benchmark (`media_guide_parser`, 6 samples, IoU vs. known table region): PP-DocLayout-S won outright — 0.3655 IoU at 7.2s/page, best of 7 detectors tested including Surya Layout and Table Transformer. plus-L variant was slightly worse and slower (0.3294 IoU, 8.0s/page) on this corpus. This is almost certainly the tool Paul actually used alongside PPStructureV3 — same ecosystem, same project.* |
| **PP-DocLayout-L** (Baidu, newer variant) | RT-DETR-L-based, claims 90.4% mAP@0.5 at 13.4ms/page on a T4 GPU | Local | Not yet tested on this project's fixtures — a real upgrade candidate over the S/plus-L variants above given the claimed accuracy/speed jump; verify on real pages before trusting the vendor number |
| **Surya Layout** | Small purpose-built transformer layout+reading-order detector | Local | *Real benchmark (`media_guide_parser`): slowest (8.5s/page) and worst IoU (0.2217) of 7 detectors tested — not recommended for this use case, despite being a reasonable-sounding default elsewhere* |
| **DocLayout-YOLO** (OpenDataLab/ByteDance) | YOLO-v10-based layout detector, trained on a large synthetic document dataset (DocSynth-300K) + DocStructBench | Local | Flagged in `media_guide_parser`'s own model research as the strongest open-source candidate — claims 70.3% mAP vs. PP-DocLayout's 67.3%, 5-10× faster inference. *Paul recalls actually attempting this one and running into install friction (specifics not confirmed) — consistent with the YOLO/Ultralytics + custom-weights install path being fussier than a pip-installable OCR library. Worth retrying with a clean environment rather than writing it off.* |

*[The PP-DocLayout-S/plus-L/Table Transformer/Surya Layout numbers above are a real 6-sample
benchmark from `media_guide_parser` (`docs/ocr_tool_reference.md` Part 3 §B2, IoU against a
hand-confirmed table region) — small sample size, but real measured numbers on real scans,
not vendor claims. PP-DocLayout-L is the clearest "probably a few better options" candidate
— it's a newer variant of the tool that already won the real benchmark. A newer, unverified
option worth knowing exists: fine-tuned YOLOv26 document-layout models started appearing on
Hugging Face in 2026 (e.g. trained on DocLayNet v1.2) — too new to have a real benchmark
against this corpus.]*

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
| **Mistral OCR** | Dedicated OCR product, ~90% accuracy on clean printed docs per current benchmarks | Cloud (API) | Strong on clean printed text; weaker on multilingual/tables/low-quality scans — pair with a table tool or a general VLM for anything more complex. *Paul tested directly on `media_guide_parser`, scanned NFL media guides 1950s–2000s — 6–16s/page at ~94.89% accuracy, chosen over local RolmOCR specifically because RolmOCR's 200–400s/page on an M1 32GB was both far slower and lower quality on real scans. The hardware constraint, not a general OCR-quality ranking, is what decided it.* |

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

---

## When the whole OCR-tool-selection problem dissolves

Everything above assumes the shape of the problem is "pick the right OCR/layout tool for
this document type." Worth naming explicitly: that assumption can just be wrong.
`media_guide_parser` (`~/github/football/media_guide_parser`) went through exactly this —
a real, working pipeline running the full stack above (deskew → layout detection →
Tesseract screening → RolmOCR/Mistral full extraction → table parsing) was later *cut*, not
improved, in a July 2026 rewrite. The replacement: render the page as an image and send it
directly to a vision-capable LLM (Claude, via tool-use) for structured extraction — no
OCR-to-text step at all for the actual read. Classic OCR (Tesseract PSM 6, cheap and fast)
still earns its keep, but only for locating *which* pages are worth extracting, not for
reading them.

The lesson isn't "VLMs beat OCR" as a general claim — it's narrower and more useful than
that: once the *extraction* step reads a rendered image directly, most of the categories
above (2 through 8) stop being a tool-selection problem for extraction and become a
tool-selection problem for cheap upstream screening only. That's a real architectural
option to name in an interview, not just a tools comparison — "we don't need to solve OCR
table-structure parsing if the model reading the page can just look at the table."
