# OCR / Document-AI Tool Deep-Dive — Function, Deployment, Trainability

*Researched 2026-08-06 via five parallel sourced research passes (general web research, not
a single-source summary) covering ~28 tools already named in `tools-survey.md`, plus a
fact-check of the r/LocalLLaMA PaddleOCR-VL/Marker/PP-StructureV3 benchmark Paul pasted
directly. Every non-obvious claim below traces to a real, cited source — vendor docs,
GitHub repos/issues, academic papers, or a named secondary source flagged as such. Where
sources disagreed or a claim couldn't be verified, that's stated explicitly rather than
picked silently. Full citations are in the Key Sources section at the bottom, grouped by
tool, kept out of the tables themselves so the tables stay readable on mobile (the study
app's table renderer only keeps plain text in cells).*

*This is a companion to `tools-survey.md` (which organizes tools by pipeline stage/job) —
this file re-slices the same ~28 tools three different ways: what they actually are
architecturally, how painful they are to run, and whether/how you could adapt one to a new
domain. Read `tools-survey.md` first for "which category does this tool belong to"; read
this file for "what is this tool, really, and could I make it better."*

---

## The anchor finding: how olmOCR actually became RolmOCR

Worth stating precisely, because it's the wrong assumption otherwise: **RolmOCR is not a
fine-tune of olmOCR.** It's a separate fine-tune of the *same base model* (Qwen2.5-VL-7B-
Instruct) on the *same training dataset* (`olmOCR-mix-0225`), built independently by
Reducto AI. Reducto's own announcement says so directly — trained on the same data,
"completely separate from the models we use in production." The original olmOCR v1 was
actually a fine-tune of an older base, Qwen2-VL-7B-Instruct; Allen AI's own newer olmOCR-2
later also moved to the Qwen2.5-VL-7B-Instruct base independently, plus added GRPO
reinforcement-learning training on top (binary "unit-test" rewards — text presence, reading
order, table-cell correspondence, math rendering fidelity — not chain-of-thought reasoning;
Ai2 explicitly distinguishes this from actual reasoning models).

**Why this matters for adapting a model to a new domain (e.g. degraded 1950s-2000s scans):**
the real, repeatable pattern isn't "fine-tune someone else's fine-tune." It's: pick a strong
open base VLM (Qwen2.5-VL-7B-Instruct is the one nearly everyone in this space converged
on), build a labeled dataset in a similar page-image-to-text/JSON format, and run your own
SFT (and optionally GRPO) pass — the same recipe Allen AI and Reducto both ran
independently, and the same recipe at least one third party has separately applied
*directly* to the olmOCR checkpoint itself (a TNG Tech write-up on fine-tuning olmOCR for
higher faithfulness — a different, also-real pattern: starting from a fine-tune rather than
the base). Both are legitimate starting points; which one to use depends on whether an
existing fine-tune already gets you closer to your target domain than the base model does.

---

## Table 1 — Function & Architecture Class

*What each tool actually is under the hood, what it was trained on, and what that predicts
about strengths/weaknesses. "Class" uses plain categories: rule-based (no model), classic
OCR (detector+recognizer, not generative), layout detector (finds regions, not text),
generative VLM (autoregressive, reads-and-writes), closed/proprietary (architecture
undisclosed), or orchestration (wraps several of the above into one pipeline).*

### Classic / rule-based OCR engines

| Tool | Class | Architecture | Training data implies | Fills a gap vs. others here? |
|---|---|---|---|---|
| Tesseract | Classic OCR | LSTM line-recognizer (v4+), classical page-segmentation heuristics, no learned text detector | Trained on ~400K synthetic rendered text lines, ~4,500 fonts — strong on clean printed text in supported fonts, weak on handwriting/heavy degradation | No — most basic option, others in this table generally beat it once layout gets messy |
| PaddleOCR | Classic OCR | Two-stage: DB detector (MobileNetV3 to PP-HGNetV2 backbones) + SVTR/CRNN recognizer, CTC or attention decode | Baidu's in-house Chinese-centric web/document/handwriting corpus, heavily augmented | Strongest CJK + mixed scene-text coverage of the classic engines |
| RapidOCR | Classic OCR | ONNX export of PaddleOCR's trained det/rec weights, runs via ONNXRuntime/OpenVINO/TensorRT | Same as PaddleOCR (inherits its weights) | Same OCR quality as PaddleOCR without the PaddlePaddle framework dependency |
| EasyOCR | Classic OCR | CRAFT detector + CRNN recognizer (CNN+LSTM, CTC decode) | Substantially synthetic-data trained (SynthText-style) across 80+ scripts | Broadest out-of-box script/language coverage of the four |
| DocTR (Mindee) | Classic OCR | Modular: swappable detector (DBNet/LinkNet) + swappable recognizer (CRNN, SAR, ViTSTR, or PARSeq — PARSeq is a genuinely autoregressive transformer decoder, architecturally closer to a small generative model) | Not clearly documented publicly — treat provenance as unconfirmed | Most architecturally flexible; PARSeq option is the one classic-OCR tool here with a generative recognizer |

### Cloud managed document-intelligence services

| Tool | Class | Architecture | Training data implies | Fills a gap vs. others here? |
|---|---|---|---|---|
| AWS Textract | Closed/proprietary | Undisclosed deep-learning CV model; AWS pairs it with LayoutLM-style transformers downstream in their own reference architectures, implying the core model itself is a distinct undisclosed design | Trained on "millions of documents spanning dozens of industries," no composition published | Real gap: no strong open-source equivalent to AnalyzeID/table-structure at this reliability without assembling multiple OSS models yourself |
| Azure AI Document Intelligence | Closed/proprietary | Undisclosed; Microsoft Research's TrOCR (ViT encoder + autoregressive decoder) is plausibly related but not confirmed as what's in production | Prebuilt models trained per document type (invoice/receipt/ID); handwriting is a documented distinct capability flag | Native Markdown-formatted output aimed explicitly at RAG chunking — a real differentiator |
| Google Document AI | Closed/proprietary, processor-based | Explicitly many separate models: General (OCR/Form Parser), Specialized/pretrained (Invoice/Receipt/ID parsers), Custom (trainable). Newer custom extractor is confirmed generative-AI-backed | Each specialized processor trained per document type; no composition published | Widest named catalog of ready-made per-document-type parsers (30+ invoice fields, dedicated ID parsers) |

### VLM-based dedicated OCR models

| Tool | Class | Architecture | Training data implies | Fills a gap vs. others here? |
|---|---|---|---|---|
| GOT-OCR2.0 | Generative VLM, OCR-specific | ~80M vision encoder + ~0.5B decoder (Qwen-0.5B lineage), 580M total, straight-line generation, no reasoning | ~5M synthetic OCR pairs (LAION-2B/Wukong/open PDFs) plus synthetic math/table/sheet-music data — modern, synthetic-leaning, no documented historical-scan training | Smallest, fastest of the VLM-OCR options; weak spot is likely degraded/historical scans given synthetic-modern training |
| Nougat (Meta) | Generative VLM, OCR-specific | Donut-style: Swin visual encoder + transformer text decoder, straight-line generation | 91.5% arXiv papers (clean, born-digital, paired LaTeX) — the paper's own authors report measurably worse accuracy on scanned/old-textbook pages | The one model here with a source-confirmed, self-reported weakness on exactly the degraded-scan problem this repo cares about |
| Qwen2.5-VL (base model) | Generative VLM, general-purpose | ViT visual encoder (window attention) + Qwen2.5 LLM decoder, MRoPE for video/temporal; instruction-tuned, no built-in reasoning mode | General multimodal pretraining, not document-specific — this is the base every olmOCR-lineage model fine-tunes from | Not itself a document tool, but the foundation the strongest fine-tunes in this list are built on |
| olmOCR / olmOCR-2 (Allen AI) | Generative VLM, fine-tuned for OCR | v1: SFT of Qwen2-VL-7B-Instruct. v2: SFT + GRPO RL fine-tune of Qwen2.5-VL-7B-Instruct. RL rewards are binary unit tests, not chain-of-thought reasoning | `olmOCR-mix-0225`: ~250K pages GPT-4o-annotated from 240M+ web-crawled PDFs, plus synthetic verifiable unit tests in v2 — modern web-crawled PDFs, not scanned pre-digital documents | Fully open data-generation-to-training pipeline (not just weights) — the most transparent lineage in this table |
| RolmOCR (Reducto AI) | Generative VLM, fine-tuned for OCR | Direct fine-tune of Qwen2.5-VL-7B-Instruct, straight-line generation, no reasoning | Full `olmOCR-mix-0225` dataset, ~15% samples rotated for skew robustness; drops PDF metadata from the prompt (latency/VRAM optimization, not an accuracy feature) | Real-world verdict from `media_guide_parser`: lost to Mistral OCR on both speed and quality on M1 hardware specifically — see Table 2 |
| PaddleOCR-VL 1.5 | Generative VLM, OCR-specific | NaViT-style native-resolution visual encoder + ERNIE-4.5-0.3B decoder, ~0.9-1B total, straight-line generation | Explicitly built and evaluated against a "Real5-OmniDocBench" set covering scanning artifacts, skew, warping, screen photography — the one model here whose training explicitly targets real-world capture conditions, though 1950s typewriter print specifically isn't called out | Smallest capable VLM-OCR model, most consumer-hardware-friendly; genuinely different training focus (real-world capture robustness) than GOT-OCR2.0/Nougat's cleaner data |
| Mistral OCR | Closed/proprietary | Architecture entirely undisclosed — no public statement on base model or design | Training data composition entirely undisclosed; treat as permanently closed, not "not yet published" | Real gap in practice (won on `media_guide_parser`'s actual hardware) but a dead end for further customization — see Table 3 |

### Document-parsing orchestration frameworks

| Tool | Class | Architecture (sub-models it wraps) | Training data implies | Fills a gap vs. others here? |
|---|---|---|---|---|
| Docling (IBM) | Orchestration | RT-DETR-derived layout detector (retrained on DocLayNet) + TableFormer for table structure + pluggable OCR (EasyOCR/Tesseract/RapidOCR); newer Granite-Docling option replaces the whole stack with one ~258M VLM | DocLayNet — deliberately diverse sources, shown in research to generalize better than PubLayNet/DocBank-trained models | Cleanest unified JSON/Markdown export, no GPU required for the classic pipeline — real overlap with Unstructured on the DocLayNet lineage |
| Unstructured.io | Orchestration | Detectron2 (Faster R-CNN) or YOLOX layout detector, both DocLayNet-pretrained, + PDFMiner text extraction + Tesseract fallback + optional Table Transformer | Same DocLayNet lineage as Docling — similar strengths/weaknesses | Real differentiator is breadth (25-30+ file types behind one API), not parsing quality — genuine redundancy with Docling on the core mechanism |
| MinerU (OpenDataLab) | Orchestration | doclayout_yolo (layout) + UniMERNet (formula) + PaddleOCR (text) + table module; MinerU2.5 adds an alternative two-stage VLM backend | doclayout_yolo trained on DocLayNet + DocSynth300K; org has a strong scientific-literature/CJK bent | Real differentiation on math-heavy and CJK corpora — not redundant for that use case even though it overlaps generically with Docling/Marker |
| LlamaParse | Orchestration, cloud-only | Four modes (no-AI fast text, LLM layout reconstruction, LVM page-image reading, agentic reasoning loop); backing models are third-party frontier LLMs (OpenAI/Anthropic/Google), not a bespoke trained stack | N/A — quality depends on whichever frontier model backs the selected mode | Genuinely different tool class (managed API + agentic reasoning, zero ops burden) — not redundant, fills the "handle the messiest documents without running your own GPU stack" gap |
| Marker (datalab-to) — v1 | Orchestration | `pdftext` native-text extraction + original Surya toolkit as separate detection/OCR/layout/table/reading-order/LaTeX models, optional LLM-assist mode | Surya trained on multilingual Common Crawl PDFs + synthetic low-resource-language data | This is the version the Jan 2026 Reddit benchmark actually tested — see verification section |
| Marker (datalab-to) — v2 (~Jul 2026, supersedes v1) | Orchestration → single-model | Rebuilt around Surya OCR 2, one ~650M VLM doing layout+OCR+table in one pass, `pdftext` tried first, VLM invoked only for hard pages | Same Surya lineage, newer unified model | Architecturally converged toward the "one VLM does everything" pattern PaddleOCR-VL/olmOCR also use — worth knowing the Reddit benchmark predates this rewrite |
| PP-StructureV3 (as a full pipeline) | Orchestration | Preprocessing (orientation/rectification) → PP-DocLayout_plus-L layout detection → PP-OCRv5 text → SLANeXt/SLANet_plus table structure → dedicated reading-order-recovery module | Baidu's self-built Chinese/English corpus (papers, contracts, books, exams) | Heaviest real redundancy of this group — MinerU literally uses PaddleOCR as its OCR backend; PP-StructureV3's distinguishing trait is being the most config-swappable, not doing a fundamentally different job |

### Layout / table-structure detectors

| Tool | Class | Architecture | Training data implies | Fills a gap vs. others here? |
|---|---|---|---|---|
| Table Transformer (Microsoft) | Layout detector, table-structure-specific | Two separate DETR models — one for table detection, one for internal row/column/cell structure | PubTables-1M — ~948K annotated tables from PubMed Central scientific articles | Table-structure-specific, not general layout — pairs with a general layout detector rather than competing with one |
| PP-DocLayout-S / M / L / plus-L | Layout detector, general | Size-tiered family: PicoDet-S (S), PicoDet-L (M), RT-DETR-L (L and plus-L, different retrains) | Baidu's self-built Chinese/English corpus (papers, PPT, contracts, books, exams) | Same model family PP-StructureV3 embeds by default (plus-L) — real redundancy if you're already using PP-StructureV3, useful standalone if you only need layout boxes |
| Camelot | Rule-based, no model | Lattice (grid/line-geometry detection) or Stream/Network/Hybrid (whitespace/alignment heuristics); optional ML extra calls Table Transformer | N/A — no training data, works only on digitally-generated (text-layer) PDFs | Only viable option here with zero model weights — cheapest, but useless on scanned images |
| img2table | Rule-based, no model | OpenCV contour/line detection, explicitly positioned as a lighter CPU-only alternative to deep-learning table detectors | N/A — no training data | Works on both PDFs and images (Camelot doesn't do images); still table-only, no general layout |
| layout-parser | Layout detector, general | Wraps Detectron2 (Faster/Mask R-CNN, typically ResNet-50-FPN); Effdet/PaddleDetection backends available via extras | Model zoo weights pretrained on PubLayNet, PRImA, HJDataset, Newspaper Navigator, TableBank — each separately licensed | General region detector, same job as PP-DocLayout/DocLayout-YOLO/Surya Layout — differentiated mainly by architecture and (poor) install friction, not capability |
| Surya Layout | Layout detector, now unified with OCR/table | Single ~650M VLM (Qwen3.5-style) emitting layout JSON or full-page HTML from one model — same architectural direction as PaddleOCR-VL/Marker v2 | Described only as "diverse document images," no named public dataset; evaluated on PubLayNet + olmOCR-bench | Broadest label set (Table/Figure/Caption/Footnote/Equation/Header/Footer/Code/Form) of the pure layout detectors, plus does OCR/table itself — closer to a mini orchestration tool than a pure detector now |
| DocLayout-YOLO (OpenDataLab) | Layout detector, general | YOLOv10-based (Ultralytics codebase) with an added multi-scale "Global-to-Local" module | DocSynth-300K synthetic pretraining, fine-tuned/evaluated on D4LA and DocLayNet | Real, verified strength (see Table 2 for the license caveat) — flagged in `media_guide_parser`'s own research as the top untested candidate |

---

## Table 2 — Deployment & Install Profile

*Size, speed, license, local-vs-cloud, and specifically whether there's a Java/JVM
dependency anywhere in the chain — a real, verified concern, not a hypothetical one (see
the callout below the table).*

### Classic / rule-based OCR engines

| Tool | Size / hardware | Speed | License | Local / Cloud | Java/JVM? | Install friction |
|---|---|---|---|---|---|---|
| Tesseract | Small, CPU-only | Fast on clean printed text | Apache 2.0 | Local | No | Depends on Leptonica (image lib) — historically a Homebrew linking pain point, mostly resolved now |
| PaddleOCR | 0.07B (mobile) to larger server variants | >370 chars/sec on a CPU (mobile model, per Baidu's own numbers) | Apache 2.0 | Local | No | Real, active pain: PaddlePaddle install from a non-PyPI mirror, CUDA/cuDNN version pinning, numpy<2.0 requirement, Python 3.12+ setuptools breakage — confirmed via multiple open GitHub issues, not just anecdote |
| RapidOCR | Under 20MB per model | Faster than PaddleOCR on CPU (ONNXRuntime) | Apache 2.0 | Local | No | `pip install rapidocr onnxruntime` — directly solves PaddleOCR's install pain by dropping the PaddlePaddle framework dependency entirely |
| EasyOCR | Gen-2 models smaller/faster than gen-1 (no absolute numbers published) | Not benchmarked in official docs | Apache 2.0 | Local | No | Pure PyTorch — GPU install needs a matching CUDA-version torch build, a common but ordinary source of friction |
| DocTR | Varies by chosen backbone | Not benchmarked for Apple Silicon/MPS in what was found | Apache 2.0 | Local | No | Dual backend (PyTorch or TensorFlow) means picking one dependency tree, not two — otherwise straightforward |

### Cloud managed document-intelligence services

| Tool | Size / hardware | Speed | License | Local / Cloud | Java/JVM? | Install friction |
|---|---|---|---|---|---|---|
| AWS Textract | N/A — API only | ~2-4s/page typical; async batch reports ~200 pages under 2 min, though users report occasional degradation | Proprietary, usage-billed | Cloud | No | Thin SDK call (boto3), no local weights; HIPAA-eligible since Oct 2019 with a signed BAA |
| Azure AI Document Intelligence | N/A — API only | Reports vary widely — some API versions ~30-35s/file regardless of size, newer versions ~5-10s, per Microsoft's own troubleshooting docs acknowledging latency issues | Proprietary, usage-billed | Cloud | No (Java SDK is one optional client, not required) | Thin SDK; HIPAA BAA-eligible, GDPR/ISO 27001/SOC-aligned per Microsoft |
| Google Document AI | N/A — API only | ~2-4s/page typical; cross-cloud calls (e.g. from AWS-hosted infra) reportedly add 200-500ms | Proprietary, usage-billed | Cloud | No (Java client is one optional SDK) | Thin gRPC/REST client; HIPAA-compliant with BAA, FedRAMP High, documents not used for training and processed in-memory for sync calls |

### VLM-based dedicated OCR models

| Tool | Size / hardware | Speed | License | Local / Cloud | Java/JVM? | Install friction |
|---|---|---|---|---|---|---|
| GOT-OCR2.0 | 580M total (~80M encoder + ~0.5B decoder) | No official Apple Silicon numbers found | Code Apache 2.0; released training data is CC BY-NC 4.0 (non-commercial) — matters if you'd reuse their data mix, not just the weights | Local | No | Small enough for plausible single-consumer-GPU fine-tuning; official repo + community `ms-swift` LoRA path both exist |
| Nougat | Smaller than the 7-8B VLM class (exact params not surfaced) | Not benchmarked here | MIT | Local | No | Straightforward — HF `transformers` integration |
| Qwen2.5-VL (base) | 3B / 7B / 32B / 72B, AWQ-quantized variants available | ~69.8 tok/s reported for 7B Q4_K_M GGUF on an M5 Max (high-end chip, one source, not cross-verified) | Apache 2.0 | Local or API | No | Extremely well-trodden — `2U1/Qwen-VL-Series-Finetune` and multiple community LoRA guides exist |
| olmOCR-2 | 7B (Qwen2.5-VL base) | ~37 sec/page on an M5 Pro via a community MLX 8-bit port (one benchmark) | Apache 2.0 | Local | No | Official guidance wants ≥12GB VRAM NVIDIA GPU (RTX 4090/L40S/A100/H100 tested); community MLX ports exist for Apple Silicon |
| RolmOCR | 7-8B (Qwen2.5-VL base, BF16) | 200-400s/page on an M1 32GB via transformers/MPS — real number from `media_guide_parser` | Apache 2.0 | Local | No | Recommended serving via vLLM/Docker; no official or community Apple Silicon/MLX build found — a real gap if local Mac inference matters |
| PaddleOCR-VL 1.5 | ~0.9-1B — smallest VLM-OCR model in this table | ~53 sec/page on an M5 Pro (PaddleOCR-VL 1.6, one benchmark) — slower per-page than olmOCR-2 despite being ~7x smaller, attributed to pipeline overhead | Apache 2.0 | Local | No | Real, dedicated Apple Silicon support: official docs page plus a native Swift+MLX port and an MLX weight conversion — best-documented Mac path of the VLM-OCR options |
| Mistral OCR | Undisclosed | 6-16s/page, ~$1/1000 pages, ~94.89% accuracy on clean printed docs — real numbers from `media_guide_parser`'s own production use | Proprietary API; limited "self-host on selective basis" option exists but is not a fine-tunable/open path | Cloud (API), limited self-host | No | Trivial to call (API), but see Table 3 — this is the one tool here with no customization path at all |

### Document-parsing orchestration frameworks

| Tool | Size / hardware | Speed | License | Local / Cloud | Java/JVM? | Install friction |
|---|---|---|---|---|---|---|
| Docling | No GPU required for the classic pipeline; Granite-Docling VLM option is ~258M | Not benchmarked here | MIT | Local | No (a separate optional `docling-java` API wrapper exists, not a build dependency) | `pip install docling` + OCR-engine extras (`easyocr`/`tesserocr`) needing system Tesseract — otherwise clean |
| Unstructured.io | Depends on chosen detection backend (Detectron2/YOLOX) | Not benchmarked here | Apache 2.0 | Local (+ managed API option) | No — distinct project from Apache Tika, sometimes confused with it | Needs system packages: `poppler-utils`, `tesseract-ocr`, `libreoffice` (Office docs), `pandoc` (EPUB) |
| MinerU | Varies by backend (classic pipeline vs. VLM backend) | Not benchmarked here | Moved from AGPLv3 to a custom Apache-2.0-based "MinerU Open Source License" specifically to ease commercial adoption | Local | No | Classic pipeline backend inherits PaddleOCR/PaddlePaddle's install pain unless you use the newer VLM backend instead |
| LlamaParse | N/A — cloud/API, or self-hosted BYOC calling out to your own OpenAI/Anthropic/Google keys | Depends entirely on selected mode/backing model | Proprietary, usage-billed; enterprise self-host via Helm/Kubernetes | Cloud (+ enterprise self-host) | No | `pip install llama-parse` + API key; enterprise self-host needs Kubernetes/Helm, not a vanilla pip install |
| Marker v1 | Torch-based, CPU fallback with `TORCH_DEVICE` override | 3.2 min (T4) / 54.0s (A10G) / ~70s (L4) for a 15-page paper, per the Reddit benchmark | Code Apache 2.0; model weights are OpenRAIL-M (free for research/personal/startups under $5M funding-or-revenue, commercial license required above that) | Local (+ hosted Datalab API, ~$4/1000 pages, $25/mo free credit) | No | `pip install marker-pdf torch` — genuinely simple per the benchmark and Marker's own docs, though a GitHub issue flags occasional torch version-mismatch on install |
| Marker v2 | ~650M unified VLM | Claimed 5x+ MinerU's pipeline throughput, 76.0% olmOCR-bench (83.5% on born-digital PDFs) — vendor numbers | Same split license as v1 | Local (+ hosted API) | No | Same install path as v1; released after the Reddit benchmark, so those specific numbers don't reflect v2 |
| PP-StructureV3 (full pipeline) | Multiple sub-model sizes, RT-DETR-L-class layout stage by default | 51.3s (A10G, default config) / 26.2s (A10G, lightweight) / 31.7s (L4, lightweight) for a 15-page paper, per the Reddit benchmark | Apache 2.0 | Local | No | Same PaddlePaddle install pain as PaddleOCR above (shared dependency) |

### Layout / table-structure detectors

| Tool | Size / hardware | Speed | License | Local / Cloud | Java/JVM? | Install friction |
|---|---|---|---|---|---|---|
| Table Transformer | DETR-class | ~12s/image reported on CPU-class runs vs. sub-second on GPU (one comparative source) | MIT | Local | No | GPU strongly preferred; otherwise a standard HF `transformers` install |
| PP-DocLayout-S | PicoDet-S (lightweight) | Fastest of the PP-DocLayout tiers, CPU-viable | Apache 2.0 | Local | No | Same PaddlePaddle framework dependency as other Paddle-ecosystem tools |
| PP-DocLayout-M | PicoDet-L | Between S and L in speed/accuracy | Apache 2.0 | Local | No | Same as above |
| PP-DocLayout-L | RT-DETR-L | GPU-oriented; claimed 90.4% mAP@0.5 at 13.4ms/page on a T4 (vendor number) | Apache 2.0 | Local | No | Same as above |
| PP-DocLayout_plus-L | RT-DETR-L (different retrain) | GPU-oriented; this is the variant PP-StructureV3 uses by default | Apache 2.0 | Local | No | Same as above |
| Camelot | No model, CPU-only | Fast — no inference step | MIT | Local | No | Needs OpenCV + Ghostscript system dependency — real friction, but not Java |
| img2table | No model, CPU-only by design | Fast; recent releases added numba-accelerated routines | MIT | Local | No | Lightest install in this whole table — no model weights at all |
| layout-parser | Detectron2 (Faster/Mask R-CNN) | Not benchmarked here | Apache 2.0 (toolkit) | Local | No | The most fragile install in this entire deep-dive — Detectron2 must be installed separately, needs matching PyTorch/CUDA builds, and the project's own docs say a one-line Windows install is "nearly impossible" |
| Surya Layout | ~650M unified VLM | ~5 pages/sec reported on an RTX 5090 — GPU-oriented | Code Apache 2.0; model weights are a modified OpenRAIL-M (same commercial-use gate as Marker's weights — free under $5M funding/revenue, licensed above that) | Local | No | No public fine-tune docs — maintainers direct custom-training requests to a support email rather than a self-serve path |
| DocLayout-YOLO | YOLOv10-based | 85.5 FPS reported on a single A100 GPU | **Confirmed AGPL-3.0 in the repo's LICENSE file** — but the Hugging Face model card/Space are separately marked Apache 2.0, with no maintainer clarification found; genuine open licensing question, verify before commercial use | Local | No | Plain pip install (`doclayout-yolo`), no unusual friction beyond the license ambiguity |

---

## Table 3 — Fine-Tuning / Trainability

*Can you actually adapt this tool to a new domain, and how? This is the table most
directly aimed at your question — which of these could become "your own RolmOCR" for
degraded 1950s-2000s scans.*

### Classic / rule-based OCR engines

| Tool | Fine-tunable? | Path | Data format / effort |
|---|---|---|---|
| Tesseract | Yes | `tesstrain` repo (Make-based, v5), `--continue_from` a checkpoint for real fine-tuning rather than from-scratch | Ground-truth line images + text; needs GNU Make ≥4.2 and a training-tools build |
| PaddleOCR | Yes | Documented config-driven fine-tuning; official guidance suggests ≥5,000 labeled recognition samples if not changing the character dictionary | Multiple community walkthroughs exist for custom recognition training |
| RapidOCR | No — inference-only | Customization means fine-tuning PaddleOCR/PaddleX itself, then re-exporting to ONNX | N/A |
| EasyOCR | Yes, but not built into the pip package | Separate `deep-text-recognition-benchmark`-derived trainer bundled in the repo; maintainer (Jaided AI) also sells commercial custom-training services | Needs `fire`, `lmdb`, `opencv-python`, `natsort`, `nltk`, PyTorch |
| DocTR | Yes, actively used by the community | `references/detection` and `references/recognition` training scripts in-repo; `--resume` for continuing from a checkpoint; custom-vocabulary fine-tuning discussed directly by maintainers for new languages | Real GitHub Discussion threads confirm people fine-tuning for new scripts/domains |

### Cloud managed document-intelligence services

| Tool | Fine-tunable? | Path | Data format / effort |
|---|---|---|---|
| AWS Textract | Partially — Adapters | `CreateAdapter`, currently scoped only to the Queries feature type; trains an extraction-layer adapter over the fixed OCR backbone, 2-30 hours depending on dataset size | Not the underlying OCR model itself — adapter training reported free, inference billed separately |
| Azure AI Document Intelligence | Partially — Custom template or Custom neural models | Custom neural = fine-tuned from a Microsoft base model pretrained on a large document collection; minimum ~5 documents, training up to 30 minutes, select regions only | ≤50,000 pages / 1GB training data ceiling for neural models |
| Google Document AI | Partially — Custom Document Extractor + "uptraining" | Three approaches: template-based, model-based, or generative-AI-based extractor; uptraining incrementally improves an existing pretrained processor (e.g. Invoice Parser) with your own labels | Documented minimum 10 training + 10 test documents; hundreds-to-thousands improve accuracy on complex/variable documents |

### VLM-based dedicated OCR models

| Tool | Fine-tunable? | Path | Data format / effort |
|---|---|---|---|
| GOT-OCR2.0 | Yes | Official `train_GOT.py` for post-training on released weights; community-standard route is `ms-swift` with documented LoRA support and multi-GPU DeepSpeed configs | Released model training data is CC BY-NC 4.0 (non-commercial) — matters if reusing their data, not just weights |
| Nougat | Yes, real and documented | HF's own docs point to fine-tuning tutorial notebooks; a dedicated community repo (`NormXU/nougat-latex-ocr`) exists specifically for fine-tuning on custom data | MIT-licensed, no unusual restriction |
| Qwen2.5-VL (base) | Yes, extremely well-trodden | `2U1/Qwen-VL-Series-Finetune` provides ready-made full-FT/LoRA/QLoRA scripts; many blog walkthroughs exist | Reported real number: LoRA fine-tuning the 7B model used ~20GB VRAM on a single RTX 4090 24GB, including image batches — feasible on one consumer GPU |
| olmOCR-2 | Yes, most transparent of the group | `allenai/olmocr` repo ships `train.py` (SFT) and `grpo_train.py` (RL), plus the actual data-generation scripts (`buildsilver.py`, `mine_html_templates.py`) — the full pipeline is open, not just weights | No LoRA explicitly documented in-repo, but nothing prevents applying it since the base is stock Qwen2.5-VL |
| RolmOCR | Yes, inherited from its base | No RolmOCR-specific training script published, but since it's an ordinary Qwen2.5-VL-7B-Instruct SFT checkpoint, it inherits the whole Qwen2.5-VL fine-tuning ecosystem (ms-swift, `2U1/Qwen-VL-Series-Finetune`, standard HF LoRA/QLoRA) | Practical recipe: reproduce RolmOCR's own approach — base model + an olmOCR-style dataset format + your own labeled pages |
| PaddleOCR-VL 1.5 | Yes, officially documented | Baidu's ERNIEKit toolkit supports SFT directly, with a dedicated guide (`paddleocr_vl_sft.md`) covering data prep through training; active community fine-tuning discussions confirmed on HF/GitHub | Uses `text_info`/`image_info` structured data format; smallest model here (~1B) — most consumer-GPU-friendly to actually fine-tune |
| Mistral OCR | **No** | No fine-tuning capability documented for the OCR product specifically — Mistral's fine-tuning API/tooling applies only to their general LLM line. Limited self-hosting exists for data-privacy reasons but doesn't grant training access | If you need a fine-tunable model, this one is disqualified — you can only prompt/pre/post-process around a black box |

### Document-parsing orchestration frameworks

| Tool | Fine-tunable? | Path | Data format / effort |
|---|---|---|---|
| Docling | Partially | No turnkey fine-tuning API for the classic layout/TableFormer stack, but code is MIT and open; documented path is fine-tuning the newer Granite-Docling VLM via DocTags-format training data | Requires switching to the Granite-Docling variant to get a real fine-tuning story |
| Unstructured.io | Yes, via swappable backend | Detection backend (Detectron2/YOLOX) is swappable via a `model` parameter to any Detectron2-zoo model; both Apache 2.0 | Fine-tuning happens at the Detectron2/YOLOX level, same as `layout-parser` below |
| MinerU | Yes, sub-models are independently open | `doclayout_yolo` and `UniMERNet` are separately open-sourced with documented training pipelines | Fine-tune the specific sub-model that's underperforming, not the whole MinerU pipeline at once |
| LlamaParse | No model fine-tuning | Customization is via free-text parsing instructions/prompts, mode/preset selection, page-level config; enterprise self-host is BYOC infra, not a retrainable model | N/A |
| Marker (v1/v2) | Yes, via Surya | Surya's detection/recognition models are open-sourced with training code, aimed at ML engineers rather than a turnkey UI | No dedicated Marker-level fine-tune docs found — you'd fine-tune Surya directly |
| PP-StructureV3 (full pipeline) | Yes, most mature documented story of the orchestration group | PaddleX ships full training pipelines for every sub-module (layout, OCR, table, formula) since Baidu trains and releases each one itself | Fine-tune whichever stage is the actual bottleneck |

### Layout / table-structure detectors

| Tool | Fine-tunable? | Path | Data format / effort |
|---|---|---|---|
| Table Transformer | Yes, real and documented | COCO-style bbox annotation (Label Studio recommended), standard DETR fine-tuning loop, a working HF Transformers-Tutorials notebook exists with a model-name swap | MIT license, no restriction |
| PP-DocLayout family (S/M/L/plus-L) | Yes | PaddleX's layout-detection "secondary development"/custom-training guide; standard PaddleX train/export workflow on custom COCO-format data | Apache 2.0 across all four sizes |
| Camelot | N/A — no model | Only heuristic parameters (line thresholds, etc.) are tunable, not a trainable model | N/A |
| img2table | N/A — no model | Same as Camelot — heuristic parameters only | N/A |
| layout-parser | Yes, real and documented | Companion `layout-model-training` repo: convert annotations to COCO format (a PAGE→COCO converter is provided for PRImA-style data), duplicate a Detectron2 config, run standard Detectron2 training | No explicit dataset-size/compute guidance published |
| Surya Layout | Not self-serve | No public fine-tune script/docs found; maintainers direct custom-training requests to a support email rather than a documented path | Contact-only, not a DIY path today |
| DocLayout-YOLO | Yes, real and documented | Ultralytics/YOLOv10-style training via `assets/script.sh`, standard YOLO-format annotations; paper's setup used 8 GPUs/batch 64, though smaller single-GPU fine-tunes are feasible for narrower domains | Verify the AGPL-3.0-vs-Apache-2.0 license ambiguity (Table 2) before committing to this for anything commercial |

---

## Ranked: best fine-tuning candidates for a degraded historical-scan domain

Given everything above, applied to a domain like `media_guide_parser`'s 1950s-2000s faded/
skewed NFL media guide scans:

1. **Qwen2.5-VL-7B-Instruct / olmOCR-2 / RolmOCR** — one well-documented Apache-2.0 base, fully open SFT (and GRPO) scripts, and the largest active LoRA fine-tuning community of anything in this table. The most direct, lowest-risk path: reproduce RolmOCR's own recipe (base model + an olmOCR-style dataset format + your own labeled degraded pages).
2. **PaddleOCR-VL 1.5** — smallest model here (~1B), most consumer-GPU-friendly to actually train, has an *official* SFT guide (not just community scripts), and its training data explicitly targets scan/skew/warp robustness — the closest existing training focus to your actual problem, even though it doesn't specifically claim 1950s-era typewriter print.
3. **Nougat** is worth knowing even if you don't fine-tune it — it's the one model in this whole research pass whose own authors published a direct admission of weakness on exactly your kind of degraded scan. Useful as a citable cautionary data point regardless of what you ship.
4. **Mistral OCR is not a candidate at all** — no fine-tuning path exists for the OCR product, full stop. It's the pragmatic production choice on constrained hardware (as `media_guide_parser` already found), not a model you can ever adapt further yourself.

---

## Java/JVM dependency callout

None of the ~28 tools surveyed above have a Java/JVM dependency anywhere in their stack —
worth stating plainly since that was a real, named concern going in. The pain point you're
thinking of belongs to a genuinely separate lineage of document tools, not anything in this
survey:

- **Apache Tika** — a Java library for text/metadata extraction across many formats;
  OCR support comes via a bundled/external Tesseract call, but Tika itself runs on a JVM.
- **tabula-java** (the engine behind the Tabula table-extraction tool) — Java, distributed
  via Maven, built directly on Apache PDFBox.
- **Apache PDFBox** — itself a Java PDF-manipulation library, underlying both Tika's PDF
  parser and tabula-java.

If any future tool comparison surfaces one of these three by name, that's the actual
Java-dependency risk to flag — not anything already in this repo's survey.

---

## License callout — verify before commercial use

Several tools in this table carry licensing that isn't simple "pip install and ship":

- **MinerU** moved from AGPLv3 to a custom Apache-2.0-based license specifically to reduce
  commercial friction — a real, deliberate fix worth knowing about if AGPL was previously a
  blocker.
- **Marker (v1 and v2)** and **Surya** — code is Apache 2.0, but model *weights* are a
  modified OpenRAIL-M: free for research/personal use and companies under $5M in funding or
  revenue, commercial licensing required above that threshold.
- **DocLayout-YOLO** — the GitHub repo's `LICENSE` file is confirmed AGPL-3.0, but the
  Hugging Face model card/Space are separately marked Apache 2.0, with no maintainer
  clarification found as of this research pass. Genuinely unresolved — verify directly with
  the maintainers before any commercial use, don't assume either label is authoritative.
- **GOT-OCR2.0** — code is Apache 2.0, but the *released training data* is CC BY-NC 4.0
  (non-commercial). Only relevant if you'd reuse their data mix rather than just the model
  weights.

---

## Verification: the Jan 2026 r/LocalLLaMA benchmark, fact-checked

Paul pasted the full post directly (title: "I benchmarked PaddleOCR-VL 1.5 vs Marker vs
PP-StructureV3 for PDF-to-Markdown on Modal"). WebFetch couldn't reach reddit.com directly
(a hard block, not a failed attempt), so this is cross-checked against independent sources
rather than the raw thread — findings below are corroboration, not blind trust.

- **"Marker install is trivial (`pip install marker-pdf torch`), worked first try, no
  special index/numpy pinning"** — Partially confirmed. Matches Marker's own documented
  install for CPU use. A GitHub issue (`datalab-to/marker#323`) does note torch version
  mismatches can occur, especially for GPU setups, so "worked first try" is plausible but
  not universally guaranteed. Also: this describes Marker v1 specifically, which was
  rewritten into Marker v2 (unified Surya OCR 2 VLM) roughly six months after this
  benchmark — the numbers no longer describe the current tool.
- **"PaddlePaddle/PP-StructureV3 install needs a non-standard mirror, GPU/CPU build
  issues, numpy 2.x problems"** — Confirmed. PaddlePaddle's own install docs require a
  non-PyPI, CUDA-version-specific index URL for GPU wheels; numpy 2.x incompatibility is
  independently confirmed via open GitHub issues (a transitive dependency, `albucore`,
  force-pins `numpy<2`).
- **"Marker preserves reading order, PP-StructureV3 sometimes jumbles it"** — Couldn't be
  independently reproduced, but is plausible and uncontradicted: PP-StructureV3's own docs
  describe a *separate, dedicated* reading-order-recovery module bolted on specifically to
  fix multi-column ordering, implicitly acknowledging this as a known weak point of a
  detect-then-recognize-then-reorder architecture versus a single model reasoning over the
  whole page at once. Worth noting: OmniDocBench v1.5's own reading-order leaderboard shows
  every top model scoring in a fairly tight, imperfect range — this looks like a genuinely
  hard, industry-wide problem, not a defect unique to PP-StructureV3.
- **"PaddleOCR-VL 1.5 claims ~94.5% SOTA on OmniDocBench yet was slowest/worst-quality in
  the real test"** — Partially confirmed, with a real nuance the original framing loses.
  The SOTA claim is real and vendor-sourced. "Slowest" is independently corroborated
  (5.3min vs. Marker's 54s and PP-StructureV3-lightweight's 26.2s on the same A10G). But
  "worst quality" doesn't hold up on closer reading — independent secondary sources
  describe PaddleOCR-VL 1.5's actual output quality as strong, and attribute the specific
  quality complaints (jumbled order, missed footnotes) to PP-StructureV3, not PaddleOCR-VL.
  The real story is closer to an ordinary speed/quality tradeoff (a heavier VLM is slower
  but more accurate) than a genuine contradiction of the vendor benchmark — worth
  correcting if you repeat this example, since the sharper, defensible version of the story
  is "vendor SOTA claim vs. real deployability" (which still stands, from the setup-pain
  and speed evidence), not "vendor SOTA claim vs. real quality" (which the evidence doesn't
  actually support).

---

## Key Sources

*Grouped by tool/topic. Not exhaustive — the highest-confidence source per claim; full
research trails are longer than is useful to reproduce here.*

**Classic OCR**: [Tesseract docs](https://tesseract-ocr.github.io/tessdoc/) ·
[tesstrain](https://github.com/tesseract-ocr/tesstrain) ·
[PaddleOCR repo](https://github.com/PaddlePaddle/PaddleOCR) ·
[PaddleOCR 3.0 report (arXiv 2507.05595)](https://arxiv.org/pdf/2507.05595) ·
[RapidOCR](https://github.com/RapidAI/RapidOCR) ·
[EasyOCR](https://github.com/JaidedAI/EasyOCR) ·
[docTR](https://github.com/mindee/doctr) ·
[docTR models](https://mindee.github.io/doctr/latest/modules/models.html)

**Cloud services**: [AWS Textract pricing](https://aws.amazon.com/textract/pricing/) ·
[AWS Adapters docs](https://docs.aws.amazon.com/textract/latest/dg/textract-using-adapters.html) ·
[Azure Document Intelligence Layout](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/prebuilt/layout?view=doc-intel-4.0.0) ·
[Azure custom neural models](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/train/custom-neural?view=doc-intel-4.0.0) ·
[Google Document AI custom extractor](https://docs.cloud.google.com/document-ai/docs/custom-extractor-overview) ·
[Google Document AI security](https://docs.cloud.google.com/document-ai/docs/security)

**VLM/OCR lineage**: [Reducto RolmOCR announcement](https://reducto.ai/blog/introducing-rolmocr-open-source-ocr-model) ·
[olmOCR-7B-0225-preview](https://huggingface.co/allenai/olmOCR-7B-0225-preview) ·
[RolmOCR model card](https://huggingface.co/reducto/RolmOCR) ·
[Ai2 olmOCR-2 blog](https://allenai.org/blog/olmocr-2) ·
[olmOCR-2 paper (arXiv 2510.19817)](https://arxiv.org/pdf/2510.19817) ·
[olmOCR-mix-0225 dataset](https://huggingface.co/datasets/allenai/olmOCR-mix-0225) ·
[allenai/olmocr training code](https://github.com/allenai/olmocr) ·
[GOT-OCR2.0 paper (arXiv 2409.01704)](https://arxiv.org/pdf/2409.01704) ·
[Nougat paper (arXiv 2308.13418)](https://arxiv.org/pdf/2308.13418) ·
[Qwen2.5-VL technical report (arXiv 2502.13923)](https://arxiv.org/abs/2502.13923) ·
[PaddleOCR-VL-1.5 model card](https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.5) ·
[PaddleOCR-VL-1.5 paper (arXiv 2601.21957)](https://arxiv.org/pdf/2601.21957) ·
[Mistral OCR announcement](https://mistral.ai/news/mistral-ocr/)

**Orchestration**: [Docling model catalog](https://docling-project.github.io/docling/usage/model_catalog/) ·
[Docling technical report (arXiv 2408.09869)](https://arxiv.org/pdf/2408.09869) ·
[Unstructured inference](https://github.com/Unstructured-IO/unstructured-inference) ·
[MinerU pipeline backend](https://deepwiki.com/opendatalab/MinerU/2.1-pipeline-backend) ·
[MinerU changelog/license](https://opendatalab.github.io/MinerU/reference/changelog/) ·
[LlamaParse parsing modes](https://developers.llamaindex.ai/python/cloud/llamaparse/presets_and_modes/advance_parsing_modes/) ·
[Marker 2 blog](https://www.datalab.to/blog/marker-2) ·
[Marker LICENSE](https://github.com/datalab-to/marker/blob/master/LICENSE) ·
[PP-StructureV3 docs](https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/pipeline_usage/PP-StructureV3.en.md)

**Layout/table detectors**: [Table Transformer](https://github.com/microsoft/table-transformer) ·
[PubTables-1M (arXiv 2110.00061)](https://arxiv.org/abs/2110.00061) ·
[Camelot](https://github.com/camelot-dev/camelot) ·
[img2table](https://github.com/xavctn/img2table) ·
[layout-parser](https://github.com/layout-parser/layout-parser) ·
[layout-model-training](https://github.com/Layout-Parser/layout-model-training) ·
[PP-DocLayout paper (arXiv 2503.17213)](https://arxiv.org/pdf/2503.17213) ·
[Surya](https://github.com/datalab-to/surya) ·
[DocLayout-YOLO (arXiv 2410.12628)](https://arxiv.org/html/2410.12628v1) ·
[DocLayout-YOLO license issue #110](https://github.com/opendatalab/DocLayout-YOLO/issues/110)

**Reddit-benchmark verification**: [PaddlePaddle install docs](https://www.paddlepaddle.org.cn/en/install/quick) ·
[numpy pin issue](https://github.com/PaddlePaddle/PaddleOCR/issues/14708) ·
[OmniDocBench v1.5 leaderboard](https://benchmarklist.com/benchmarks/omnidocbench_1_5/) ·
secondary aggregator corroboration via thenextgentechinsider.com and marktechpost.com
benchmark write-ups (both independently describe the same Modal/T4/A10G/L4 numbers as the
pasted Reddit post).

*[Personal: this deep-dive exists because of real, hands-on tool comparisons on
`media_guide_parser` (Mistral OCR vs. RolmOCR, PaddleOCR/PPStructureV3 install pain) and
`layout-parser`/PP-DocLayout-S confusion cleared up in conversation — see
`tools-survey.md` for the pipeline-stage view of the same ground.]*
