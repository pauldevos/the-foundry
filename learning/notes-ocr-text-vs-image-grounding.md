# OCR Text vs. Image Grounding: Why an Intermediate Text Layer Introduces Hallucination Risk

**Source:** Live case study, not a talk/video — surfaced while debugging the `gamebooks_boxscores`
project (extracting defensive stats from scanned 1960s-70s NFL gamebook PDFs into structured
boxscores), 2026-07-23.
**Maps to:** Hallucination detection / faithfulness (RAG Architecture, LLM Evaluation Frameworks
decks); Document AI (RAG Architecture deck already flags this exact tension — "LlamaIndex's
document parsing product, powered by vision-language models rather than plain OCR").

The concrete case: a pipeline had a model read scanned pages, transcribe them to a text file, then
extract stats from that text. Two confirmed, real failure modes turned up: handwritten tally-mark
grids got silently undercounted (a bundled group of 5 strokes read as 4), and on badly degraded
scans the model would produce fluent, plausible-looking, completely unrelated text instead of
failing visibly — one real instance: several paragraphs of Chinese financial-disclosure
boilerplate in place of illegible English play-by-play. Switching that same model to read the
*rendered image* directly, instead of the intermediate OCR text, made both failure modes go away.
Same model. Different input modality. Why:

## 1. OCR text is already a lossy, opaque conversion

By the time text reaches the model, the original pixels are gone — replaced by whatever
characters the OCR engine committed to, with zero signal about which ones it was unsure of. A
dropped tally stroke doesn't look uncertain in the resulting text; it looks like a clean,
confident "4." The ambiguity information that would let a downstream model say "this is unclear"
was discarded one step earlier, by the OCR engine, before the model doing the reasoning ever saw
it. You can't flag uncertainty you were never shown.

## 2. Language models are trained to produce fluent, plausible continuations — that's the core objective, at two separate stages

When input text is badly garbled, there's often not enough real signal left to pin down what the
original said. A model with a strong "keep going fluently" prior and a weak grounding signal will
fill the gap with something that reads naturally, rather than stopping and saying "I don't know" —
because fluent and confident is what training rewards, in aggregate, way more than "I can't tell."
This isn't one mechanism, it's two stacked: pretraining teaches what "plausible continuation"
looks like from a huge corpus of coherent text; RLHF/instruction-tuning then further rewards
answers that read as confident and complete, because human raters systematically prefer a fluent
answer over a hedging one — even when the hedge is more honest. That's the actual mechanism behind
the Chinese-financial-text substitution: the input signal was too weak to constrain a faithful
transcription, so the model defaulted to producing *something plausible* instead of failing loudly.

## 3. Reading an image directly is perception, not continuation

The model is pattern-matching actual pixels against character/mark shapes, region by region — a
far more locally-grounded task than continuing a string of already-decoded characters. An
ambiguous or faint mark still *looks* ambiguous on the page, which is a much stronger signal to
hedge than a wrong-but-clean OCR'd word ever gives you. "Flag it inline as uncertain" actually
works when reading images, and mostly doesn't work when reading already-OCR'd text — the
uncertainty is visible in the first case and invisible in the second.

## Scale adds a fourth, separate pressure on top of all three

"Flag it and stop" is slower and more expensive per-item than "produce a plausible answer and move
on." At one document that cost difference is nothing. At thousands of documents it starts to
matter; at a hypothetical hundreds-of-millions-of-documents scale, any task framing that implicitly
rewards throughput ("process every item," a long queue, a batch waiting to finish) creates real
pressure toward the cheap behavior (smooth over and continue) over the expensive one (stop, flag,
ask) — independent of the OCR-specific mechanisms above. This is exactly why an explicit
counter-rule like "flag ambiguity, don't resolve it silently" has to be *stated*, forcefully, as a
rule rather than assumed — the default gradient, and it gets stronger with scale, points the other
way.

## Practical takeaway

If a pipeline has a model read a source image, transcribe it to text, and then have the same or
another model reason over that text to make a decision — the transcription step is a place where
grounding silently degrades to fluency. Worth asking, for any such pipeline: does the
decision-making step actually need the text intermediary, or can it read the source directly?
Text is fine for cheap/low-stakes/well-structured content (typed tables, clean prose); the risk is
concentrated exactly where the source is hardest to read faithfully in the first place — which is
also where getting it right matters most.
