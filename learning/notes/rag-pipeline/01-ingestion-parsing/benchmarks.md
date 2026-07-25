# Ingestion & Parsing — Benchmarks
*Status: QUEUED — to be built (see Queue C2 in QUEUE.md)*

## Plan
1. Find existing public benchmarks (FUNSD, PubLayNet, DocVQA, clinical document benchmarks)
2. Paul's 10-PDF test: media guides + varied PDF types
   - Compare: PyMuPDF heuristics vs Docling vs Mistral OCR
   - Measure: text extraction accuracy, table structure, layout detection
3. AWS Textract vs Azure DI: find or build clinical doc comparison

## Test corpus (to assemble)
- Paul's media guides (mixed layout, scanned + digital)
- FERC public filings (regulatory, complex tables)
- Clinical guidelines (300+ page structured)
- 2-page memos

*(Results go here once benchmarks are run)*
