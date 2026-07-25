# Portfolio Projects — Regulatory Document Ingestion
*Status: PLANNED — define scope and build (see Queue C5 in QUEUE.md)*

## Project 1: FERC Filings (Energy Transfer background)
**Dataset:** Public FERC filings at ferc.gov
**Background:** Paul worked on Energy Transfer project ingesting these
**Goal:** Build end-to-end RAG over FERC regulatory filings
**Stack:** LangGraph
**Show:** Ingestion pipeline, structural chunking, hybrid retrieval, eval

## Project 2: PHMSA (Pipeline & Hazardous Materials Safety Admin)
**Dataset:** Public regulatory docs at phmsa.dot.gov
**Goal:** Q&A over pipeline safety regulations
**Stack:** LlamaIndex
**Show:** Hierarchical chunking of long regulatory docs, metadata filtering by date/reg type

## Project 3: Texas RCC
**Dataset:** Texas regulatory documents
**Goal:** Regional regulatory Q&A
**Stack:** Raw Python (no framework — show you can do it without LangChain)
**Show:** Embed the pipeline from scratch, demonstrate tradeoffs vs framework approach

## Hosting
GitHub under PhoenixFoundry.ai organization
Each project gets its own repo with README, sample data, and eval results

*(Flesh out once Cloud Queue C3 is set up)*
