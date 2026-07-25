# Ingestion & Parsing — Tools Survey
*Status: QUEUED — to be researched (see Queue C1 in QUEUE.md)*

## Scope
Best-in-class vendor AND open-source tools for document parsing across file types.

## Tools to evaluate
PyMuPDF, Docling, Unstructured.io, AWS Textract, Azure Document Intelligence,
Mistral OCR, PaddleOCR/PPStructureV3, Camelot, pdfplumber, img2table,
Table Transformer (Microsoft), Tesseract, RapidOCR, EasyOCR, LlamaParse

## Known real-world data points
- **LlamaParse**: Paul tested — inferior to Sonnet + Mistral OCR, especially on complex clinical table structures. Not recommended for production healthcare/complex-layout PDFs.

## Comparison dimensions
- File types supported
- Table/layout handling quality  
- Output format (markdown, JSON, raw text)
- Open source vs managed
- Cost model
- Parallelizable for batch processing?
- Scale characteristics
- Verdict / when to use

*(Fill in after research)*
