# Glossary — AI Director / FDE Terms

First-pass glossary, terms drawn from the decks and lecture notes already built (not
generic definitions pasted in) — grows as more decks and lectures get added.
Alphabetical. **85 terms in this pass**, target 300+.

---

**A2A (Agent-to-Agent Protocol)** — Open standard letting independent agents built on different frameworks discover each other, delegate tasks, and collaborate. Complements MCP (which connects an agent to its tools) rather than replacing it.

**Agentic RAG** — RAG where an agent decides whether/how/when to retrieve, potentially iterating or reformulating queries, rather than a fixed retrieve-then-generate pipeline.

**Answer Relevancy (RAGAS)** — Metric measuring whether an answer actually addresses the question asked, computed via embedding similarity between the original question and synthetic questions generated from the answer.

**AutoGen / MAF** — Microsoft's conversation-centric multi-agent framework; strong in enterprise/Azure ecosystems.

**Axial Coding** — Synthesizing informal "open codes" (first-pass error notes) into named failure-mode categories, typically LLM-assisted.

**Backprop / Backpropagation** — The algorithm that updates a neural network's weights by propagating the prediction error backward through the network layers.

**Benevolent Dictator (eval process)** — One domain expert given authority to make judgment calls on error analysis, instead of routing every decision through committee.

**Bi-encoder** — Embeds query and document separately, then compares vectors — fast, used for initial retrieval at scale (as opposed to a cross-encoder).

**BLEU** — A metric for evaluating generated text (especially translation) against reference text; higher is better.

**BM25** — A sparse/keyword-based retrieval algorithm; scores documents by term frequency, catching exact matches embeddings can blur together.

**Catastrophic Forgetting** — When aggressive fine-tuning on a narrow dataset degrades a model's general capabilities outside that task.

**CBOW (Continuous Bag of Words)** — A word2vec training method that predicts a target word from its surrounding context words.

**Chain-of-Thought (CoT)** — Prompting the model to reason step-by-step before giving a final answer, improving accuracy on multi-step problems.

**Chunking** — Splitting source documents into retrieval-sized units; strategies include fixed-size, semantic, hierarchical, and late chunking.

**Composability (MCP)** — Any application can be both an MCP client and server simultaneously, enabling layered/hierarchical agent architectures.

**Confusion Matrix** — A breakdown of a classifier's (or LLM judge's) predictions by outcome type (true/false positive/negative) — reveals errors that a single aggregate accuracy number hides.

**Context Precision** — Of the chunks retrieved, what fraction were actually relevant (signal-to-noise in retrieval).

**Context Recall** — Of the chunks needed to answer a question, what fraction were actually retrieved (completeness of retrieval).

**Context Window** — The maximum span of tokens a model can attend to in a single call; the model's "working memory."

**Corrective RAG (CRAG)** — RAG variant where the system evaluates retrieval quality before generating, triggering a fallback if retrieved context is judged poor.

**Cosine Similarity** — Standard measure of vector relatedness — the angle between two vectors, normalized to ignore magnitude.

**Cross-Attention** — In a decoder, an attention layer where Queries come from the decoder but Keys/Values come from the encoder — pulls information from the source input into generation.

**Cross-Encoder** — Feeds query and document together into one model for a joint relevance score — slower but more accurate than a bi-encoder; used for reranking.

**DeepEval** — Python/pytest-native LLM eval framework; evals run as unit tests and fail CI on a metric threshold breach. 50+ built-in metrics including G-Eval.

**Distillation** — Training a smaller, cheaper model to imitate a larger model's outputs on a specific task.

**DPO (Direct Preference Optimization)** — Trains a model on pairs of outputs (preferred vs. not) to directly optimize preference — simpler alternative to full RLHF.

**Embedding** — A learned vector representation of a token, sentence, or document, positioned so that semantically similar items are close together in vector space.

**Embedding Drift** — When an embedding model version changes, previously-indexed vectors are in a different semantic space than newly-embedded content — degrades retrieval silently if not re-indexed.

**Faithfulness (RAGAS)** — Whether every claim in a generated answer is actually supported by the retrieved context — decomposes the answer into claims and checks each against context.

**Few-Shot Prompting** — Providing example input/output pairs in the prompt before the real request, most useful for unusual output formats.

**Fine-Tuning** — Updating a model's weights (fully or via LoRA/QLoRA) on a specific dataset to change behavior (tone, format, task specialization) rather than knowledge.

**G-Eval** — A DeepEval metric using LLM chain-of-thought reasoning to score outputs against a custom natural-language rubric.

**GraphRAG** — Retrieval over a knowledge graph of entities/relationships rather than (or alongside) vector similarity; suited to multi-hop reasoning questions.

**Hallucination** — A model generating confident, fluent, but factually ungrounded or unsupported content.

**HNSW (Hierarchical Navigable Small World)** — An approximate nearest-neighbor search algorithm using a multi-layer graph — the dominant indexing method for production vector search.

**Hybrid Retrieval** — Combining sparse (BM25) and dense (embedding) retrieval to cover both exact-match and semantic-match failure modes.

**HyDE (Hypothetical Document Embeddings)** — Retrieval technique that embeds an LLM-generated hypothetical answer instead of the raw question, since a plausible answer is often closer in embedding space to real answer documents.

**Hyperparameter** — A model/training configuration value set before training (learning rate, batch size) rather than learned from data.

**IVFFlat** — A vector index type that clusters vectors into buckets first — cheaper to build/update than HNSW, generally lower recall for the same speed.

**Label Smoothing** — Training technique that softens the target label (e.g. 1−ε instead of exactly 1) to reflect that language often has multiple valid continuations — improves metrics like BLEU.

**Late Chunking** — Embedding a full document first (capturing document-level context), then splitting into chunks afterward, so each chunk's embedding retains full-document context.

**LLM-as-Judge** — Using an LLM to evaluate another LLM's output against defined criteria; should be binary (pass/fail) and validated against human labels via a confusion matrix.

**LoRA (Low-Rank Adaptation)** — Fine-tuning method that freezes original model weights and trains a small pair of low-rank matrices added on top — cheaper to train/store, swappable across tasks.

**Lost in the Middle** — The phenomenon where LLMs reliably use information at the start/end of a long context but are measurably worse at using information buried in the middle.

**MMR (Maximal Marginal Relevance)** — Retrieval re-ranking that balances relevance against diversity, penalizing near-duplicate results.

**MoE (Mixture-of-Experts)** — Architecture routing each token to a small subset of specialized sub-networks, scaling total parameters without scaling per-token compute cost.

**Multi-Hop RAG** — Answering a question that requires chaining multiple retrieval steps, where one retrieval's result informs the next query.

**Multi-Query Retrieval** — Generating several rephrased versions of a query, retrieving for each, then merging results to increase recall.

**Open Coding** — Writing an informal note describing the first specific thing wrong in a trace, before attempting to categorize it.

**OOV (Out-of-Vocabulary)** — When a word/token at inference time wasn't seen during training and must be marked unknown; mitigated by subword tokenization.

**Parametric Knowledge** — Information encoded in a model's trained weights, as opposed to information supplied at inference time via context (retrieval).

**Perplexity** — A metric measuring how well a model predicts a sample of text; lower is better.

**Positional Encoding** — Information added to token embeddings so a Transformer (which has no inherent sense of order via self-attention alone) can represent sequence position.

**Prompt Caching** — Marking a stable prefix of a prompt as reusable across calls so the model skips reprocessing it — cuts cost and latency.

**Promptfoo** — Config-driven (YAML), language-agnostic LLM eval CLI; strong red-teaming/security-scanning engine (40+ attack types).

**Proxy Task** — A training objective (like next-word prediction) used not for its own sake but because succeeding at it forces the model to learn a useful underlying representation.

**QLoRA** — LoRA plus quantizing the frozen base model to lower precision — further cuts memory requirements for fine-tuning on smaller hardware.

**Quantization** — Compressing numeric precision (e.g. 32-bit floats to 8-bit or 4-bit) to reduce memory footprint and speed up computation, at some cost to precision.

**Query Expansion / Rewriting** — Using an LLM to reformulate a user's raw query before retrieval (resolving ambiguity, adding synonyms, splitting compound questions).

**RAGAS** — RAG evaluation framework defining metrics including faithfulness, answer relevancy, context precision, and context recall.

**ReAct (Reason + Act)** — Agent pattern alternating between generating a reasoning trace and taking a tool-call action, observing results, then reasoning again.

**Reflection (agent pattern)** — An agent self-critiquing its own output against goal/criteria and iterating before finalizing.

**Regression Eval** — Continuous evaluation against production traffic or a fixed dataset to catch silent quality drift after a model/prompt change.

**Reranking** — A second, more expensive/accurate scoring pass (often a cross-encoder) applied only to the top-k candidates from initial retrieval.

**RLHF (Reinforcement Learning from Human Feedback)** — Training method using human preference labels to shape model behavior via reinforcement learning; limited because reward models can be gamed by adversarial inputs.

**RRF (Reciprocal Rank Fusion)** — Method for merging ranked lists from multiple retrievers by summing 1/(k + rank) across lists, without needing to normalize disparate score scales.

**Sampling (MCP)** — An MCP server requesting an LLM completion from the client rather than needing its own model access — keeps servers lightweight.

**Self-Attention** — Mechanism where every token computes a weighted relevance score against every other token in a sequence, letting representations be context-dependent.

**Self-Query Retrieval** — An LLM parses a natural-language query into a structured metadata filter plus a semantic search query, applied together.

**Semantic Chunking** — Splitting text at natural breakpoints (detected via embedding similarity between adjacent sentences) rather than fixed token counts.

**Skip-gram** — A word2vec training method that predicts surrounding context words from a single target word (inverse of CBOW).

**Small-to-Big Retrieval** — Embedding and searching at a small granularity (sentences) for precision, then expanding to a larger surrounding window (parent chunk) at synthesis time. Also called parent-document retrieval.

**Sparse Retrieval** — Keyword/term-based retrieval (e.g. BM25); no semantic understanding, catches exact matches.

**Structured Output** — Constraining a model's response to a defined schema (e.g. JSON) rather than free text, for reliable downstream parsing.

**Subword Tokenization** — Splitting text on word roots (bear/bears share a root) — the industry-standard tokenization approach, balancing OOV risk against sequence length.

**Supervisor Pattern** — Multi-agent orchestration where one central coordinator delegates tasks to specialist sub-agents and synthesizes their outputs.

**Tainting (agent sandboxing)** — If an agent reads sensitive data, it's flagged and prevented from writing to non-sensitive downstream locations.

**Theoretical Saturation** — The point in error analysis where you stop finding new categories of failure — signal to stop manually labeling traces.

**Token** — The discrete unit (word, subword, or character) that text is split into before a model processes it.

**Tokenization** — The process of cutting text into tokens; approaches include word-level, subword, and character-level, each with different OOV/sequence-length tradeoffs.

**Tool Use / Function Calling** — Giving a model structured definitions of available tools it can invoke, with the runtime executing the real function and returning results into context.

**TruLens** — An LLM/RAG evaluation framework (alternative to RAGAS).

**Unit Eval** — Testing a single LLM call/component in isolation before deployment, analogous to a software unit test.

**Vocabulary Size** — The number of distinct tokens a tokenizer can produce; roughly tens of thousands for single-language models, hundreds of thousands for multilingual/code-capable models.

**Word2vec** — A 2013 technique for learning meaningful word embeddings via proxy tasks (CBOW, skip-gram); notable for capturing analogical relationships (king − man + woman ≈ queen).
