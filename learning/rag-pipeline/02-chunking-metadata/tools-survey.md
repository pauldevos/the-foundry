# Chunking & Metadata — Tools Survey
*Status: QUEUED — to be researched (see Queue C4 in QUEUE.md)*

## Chunking libraries
- LangChain: RecursiveCharacterTextSplitter, SemanticChunker, MarkdownHeaderTextSplitter, HTMLHeaderTextSplitter
- LlamaIndex: SentenceSplitter, SemanticSplitter, HierarchicalNodeParser, MarkdownNodeParser
- Chonkie: newer standalone library, worth evaluating
- Custom: heading-based structural chunker (build for clinical guidelines)

## Metadata extraction approaches
- Azure DI: extracts structural metadata (pages, language, form fields) — NOT domain-aware
- LlamaIndex MetadataExtractor: configurable, LLM-powered
- Custom LLM call: extract to structured JSON per document type

## Key design decision
Domain-aware metadata (policy ID, effective date, clinical category) requires custom extraction.
Generic tools don't know your domain's semantics.

*(Fill in after research)*
