# CME 295 — Transformers & LLMs, Lecture 1

**Instructors:** Afshine Amidi & Shervine Amidi (Stanford, Fall 2025)
**Source:** https://www.youtube.com/watch?v=Ub3GoFaUcds
**Maps to:** LLM Architecture & Tradeoffs (Tier 1, ~85% of postings)

Pulled directly from the lecture transcript — these are notes on what this specific
lecture covers and how the instructors framed it, not generic Transformer knowledge.

## Course context

1. The Amidis have taught this material as a yearly workshop since 2020/2021; it became an official Stanford course (CME 295) starting Spring 2025 — this recording is the second offering.
2. Prerequisites are deliberately light: basic ML fundamentals (what a neural network is, how training works) and basic linear algebra (matrix multiplication). The course is built to be accessible beyond ML specialists.
3. Two standard generative-text eval metrics get named early as reference points: BLEU and ROUGE (higher is better), perplexity (lower is better).

## Historical context

4. Sequence modeling ideas go back to the 1980s; LSTMs emerged in the 1990s — but without internet-scale data and compute, those approaches couldn't produce anything like today's models.
5. Word2vec (2013) was the pivotal advance in embeddings — famous for capturing relationships like king − man + woman ≈ queen, giving the field an intuitive way to reason about what embeddings actually encode.
6. The Transformer architecture (2017 paper) is the direct foundation of every modern LLM. The "LLM era" is really the Transformer scaled up in both compute and training data.

## Tokenization

7. Models process numbers, not text — tokenization (cutting text into discrete units) is the mandatory first step.
8. Word-level tokenization is simplest but has two real problems: related words (bear/bears, run/runs) become completely unrelated tokens, and it has a hard out-of-vocabulary (OOV) problem — any word not seen in training becomes unknown at inference time.
9. Subword tokenization splits on word roots, so "bear" and "bears" share a common subword — this is the actual industry-standard approach, balancing shared-root leverage against sequence length.
10. Character-level tokenization is most robust to misspellings and unusual casing, but produces much longer sequences (more compute, slower inference), and an individual character carries almost no independently meaningful representation on its own.
11. Vocabulary size scales with scope: roughly tens of thousands of tokens for a single-language model, growing to hundreds of thousands for modern multilingual + code-capable models.

## Token representation & embeddings

12. One-hot encoding is the naive way to represent tokens as vectors — but every one-hot vector ends up orthogonal to every other, so there's no way to represent that "teddy bear" and "soft" are related while "teddy bear" and "book" aren't.
13. Cosine similarity is the standard way to measure vector relatedness — the angle between two vectors, deliberately normalized to ignore their magnitude.
14. Word2vec's two training variants: Continuous Bag of Words (CBOW) predicts a target word from its surrounding context; Skip-gram does the reverse — predicting surrounding context from a target word.
15. Both are "proxy tasks" — the actual goal isn't the word-prediction itself, it's that a model capable of predicting well must have learned a meaningful internal representation of language to get there.
16. Mechanically: a small neural network takes a one-hot vector (size = vocabulary) as input, projects it down to a much smaller hidden dimension (e.g. 768), and that learned hidden-layer representation — trained via backprop against cross-entropy loss on the prediction task — becomes the token's embedding.

## Self-attention

17. Core idea: instead of processing text sequentially like an RNN, give every token direct, simultaneous access to every other token in the sequence.
18. This solves context-dependent ambiguity directly — "bank" gets a different representation depending on whether nearby context is about a river or robbery, because the representation is a function of the whole surrounding sequence.
19. Query, Key, Value (Q/K/V): a token's Query vector is compared against every other token's Key vector to get similarity weights, which are then used to combine the corresponding Value vectors into a weighted sum — that weighted sum is the token's new representation.
20. Mechanically this is `softmax(QKᵀ)V`. Expressing it as matrix operations is deliberate — GPUs are built for matrix math, which is a major reason Transformers scale so well on modern hardware.
21. Q, K, and V aren't fixed — they're learned linear projections of the token embeddings, trained end-to-end with everything else.

## Encoder-decoder architecture

22. The original Transformer (built for translation) has two halves: an encoder processing the source-language input, and a decoder generating the target-language output.
23. The encoder's job: compute a rich representation of the input where every token attends to every other token (full, unmasked self-attention).
24. The decoder uses two distinct attention layers: masked self-attention (each output token can only attend to output tokens already generated — it can't see the future, since those haven't been predicted yet), and cross-attention (the decoder's Queries attend to the encoder's Keys/Values, pulling information from the source input into the generation process).
25. Multi-head attention runs several attention computations in parallel, each with its own learned projection matrices, giving the model multiple independent "views" for relating tokens — directly analogous to multiple filters in a CNN.
26. Because self-attention gives every token direct access to every other token with no inherent sense of order, Transformers need explicit positional encoding added to the input embeddings — without it, the architecture has no way to represent sequence order at all.
27. Label smoothing: instead of training the model to predict a token with 100% certainty, the target label is softened (e.g. 1−ε on the correct token, ε spread across the rest of the vocabulary). Reflects that natural language usually has several valid continuations for a given context, and empirically improves metrics like BLEU.

## What this lecture sets up

28. This session is architecture-foundations only — tokenization through the encoder/decoder shape and multi-head attention. Positional encoding mechanics and a full worked end-to-end example are explicitly deferred to the rest of the course, not covered in depth here.
