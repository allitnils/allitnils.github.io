---
title: "LaTeX Masterclass Week 1: What Is LaTeX and Why It Matters"
description: "A clear, honest introduction to LaTeX for researchers, PhD students, and technical writers: what it is, how it differs from Word and Google Docs, why typesetting quality matters, and when LaTeX is the right tool — and when it isn't."
pubDate: 2026-06-02
tags: [latex, academic-writing, research, typesetting, mathematics, thesis-writing]
category: academic
featured: false
---

This is Week 1 of a ten-week LaTeX masterclass — the starting point, aimed at readers who have heard the name but never opened a `.tex` file.

Most people encounter LaTeX the same way: a supervisor sends a thesis template, a conference mandates it for submissions, or a colleague's paper looks noticeably better than anything Word has ever produced. The first reaction is usually confusion. The second is often frustration. The third — once it clicks — is that there is no going back for certain kinds of work.

This post is about that click moment: what LaTeX actually is, why it was built, where it genuinely outperforms alternatives, and where it doesn't. No installation yet — that is Week 2. Just the conceptual foundation that makes everything else in this series make sense.


## What LaTeX Is

LaTeX is a document preparation system. You write plain text in a `.tex` file, mark up the structure using commands, and a typesetting engine converts that into a finished document — usually a PDF.

The plain-text source might look like this:

```latex
\documentclass{article}

\begin{document}

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.

\end{document}
```

That produces a PDF with properly typeset mathematics, correct spacing, and professional-quality output. The equation is not an image you dragged in. It is described structurally — what it means, not what it should look like — and the engine handles the rendering.

This is the core idea: in LaTeX, you describe structure and content. The system handles presentation.


## A Brief History Worth Knowing

Understanding where LaTeX came from explains why it works the way it does.

In the late 1970s, Donald Knuth — one of the most influential computer scientists of the twentieth century — was preparing the second edition of *The Art of Computer Programming* and was dissatisfied with the typesetting quality available at the time. Early digital typesetting was visibly inferior to traditional hot-metal composition. Rather than accept the degraded output, Knuth spent approximately ten years building TeX, a typesetting system designed from first principles to produce mathematically correct, aesthetically rigorous output.

TeX introduced algorithms for line breaking and justification that are still the reference standard. The system was designed so that documents compiled today produce bit-identical output to documents compiled decades ago — a deliberate design choice that Knuth made to ensure long-term reproducibility.

LaTeX was built on top of TeX by Leslie Lamport in the early 1980s. Where TeX is a low-level typesetting language (powerful but requiring considerable expertise), LaTeX provides a higher-level layer of commands and document structure conventions that make it practical for everyday use without needing to understand the underlying engine.

When you run `pdflatex` on a `.tex` file today, you are using a direct descendant of Knuth's original system. The typesetting algorithms have not been replaced because they have not needed to be.


## The Fundamental Difference: Content Versus Presentation

In Microsoft Word or Google Docs, you type text and apply formatting to it directly. You select a heading, choose a font, set a size, pick a colour. The document stores both content and formatting instructions together. What you see on screen is what you get in the output.

This is WYSIWYG — What You See Is What You Get. It is intuitive and immediate. It is also the source of a category of problems that anyone who has managed a long document will recognise:

- Section numbering that drifts out of sequence when you reorder chapters
- A table of contents that requires manual updating and then doesn't quite match the final page numbers
- Reference numbers written by hand that fall out of sync as the document grows
- Inconsistent heading styles because formatting was applied piecemeal rather than from a shared definition
- A bibliography maintained in a separate document, pasted in at the end, formatted by hand

LaTeX separates these concerns. The content and the presentation rules live separately. You define that something is a `\section{}` and the document class determines what a section heading looks like — font, size, numbering, spacing — consistently, everywhere. You add `\label{sec:methods}` to a section and reference it with `\ref{sec:methods}` anywhere in the document; the correct number appears automatically in the output, regardless of how many sections have been added or removed since.

The implication for long documents — a PhD thesis, a monograph, a technical report — is significant. You are not managing formatting. You are writing, and the system handles the rest.


## The Minimal Working Example

Every LaTeX document needs a minimal structure. Here is the canonical hello-world:

```latex
\documentclass{article}

\begin{document}

Hello, world.

\end{document}
```

Save this as `hello.tex` and compile it (Week 2 covers how), and you get a single-page PDF with "Hello, world." set in Computer Modern, LaTeX's default typeface, with correct margins and line spacing.

Breaking this down:

**`\documentclass{article}`** — declares the document type. LaTeX ships with several: `article` for short documents and papers, `report` for longer documents with chapters, `book` for books, `beamer` for presentations. Each sets up a different structural and typographic framework. The document class is the first design decision you make.

**`\begin{document}` and `\end{document}`** — everything between these tags is the document content. Everything before `\begin{document}` is the preamble — where you load packages, define settings, and configure the document.

A slightly more realistic example:

```latex
\documentclass[12pt, a4paper]{article}

\usepackage{amsmath}   % extended mathematics environments
\usepackage{geometry}  % page layout control

\geometry{margin=2.5cm}

\title{A Short Note on Something Interesting}
\author{Your Name}
\date{\today}

\begin{document}

\maketitle

\section{Introduction}

This document demonstrates a basic LaTeX structure.
Mathematics integrates naturally: the famous identity $e^{i\pi} + 1 = 0$
appears inline, and displayed equations are straightforward:

\begin{equation}
  \int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
\end{equation}

\section{Conclusion}

LaTeX handles the layout. You handle the content.

\end{document}
```

This compiles to a properly titled article with numbered sections, inline and displayed mathematics, and consistent formatting — without touching a font selector or manually setting any margins beyond the `geometry` call.


## Why Typesetting Quality Matters

Quality typesetting is not aesthetic vanity. It affects readability, and readability affects how work is received.

TeX's line-breaking algorithm considers entire paragraphs simultaneously, not line by line. It optimises for visual consistency — minimising the variation in spacing across a paragraph — in a way that word processors, which process line by line, cannot match without manual intervention. The difference is subtle in short documents and becomes visible in dense technical text.

Mathematics is the clearest case. Word's equation editor has improved substantially over the years, but LaTeX mathematics remains the reference standard because it was designed specifically for that purpose. Spacing between symbols, the sizing of delimiters, the positioning of superscripts and subscripts — these are handled by algorithms built for the task.

For published academic work, conference papers, and journal submissions, LaTeX is often not just preferred but required. Many publishers in mathematics, physics, computer science, and engineering accept only LaTeX source. If your field uses LaTeX, learning it is not optional.


## When LaTeX Is the Right Tool

LaTeX earns its overhead cost in specific contexts:

**Long, structured documents.** A PhD thesis is the prototypical case. Automatic numbering, cross-references, a table of contents and list of figures generated from source, a bibliography managed by BibTeX or BibLaTeX — these compound over a 200-page document into an enormous saving in maintenance effort.

**Mathematics-heavy content.** There is no comparable alternative for typesetting complex mathematics. If your document contains non-trivial equations, LaTeX is not a stylistic preference; it is the correct tool.

**Academic papers in STEM fields.** Many conferences and journals require LaTeX source. Beyond compliance, LaTeX papers look different — in ways that reviewers and readers associate with professional quality.

**Documents requiring reproducibility.** A LaTeX source file compiled in five years produces the same output it does today. This matters for archival work, for shared templates in research groups, and for documents that will be revised over long periods.

**Structured books and reports.** The `book` and `report` document classes handle chapter management, part divisions, running headers, and document-level numbering in ways that are difficult to maintain reliably in a word processor.


## When It Isn't

Honesty about trade-offs is more useful than advocacy.

**Collaborative editing with non-LaTeX users.** If your collaborators use Word and expect tracked changes in a `.docx` file, LaTeX creates friction. Overleaf (a browser-based LaTeX editor) has reduced this significantly by providing a collaborative environment with version history, but it doesn't fully bridge the gap with Word-based workflows.

**Short, formatting-light documents.** A one-page memo, a quick internal report, a letter — the overhead of LaTeX is not justified. A word processor is faster.

**Documents where WYSIWYG iteration matters.** If your process involves frequent visual adjustment — tweaking the look of a layout, moving elements around — the compile-check-adjust cycle of LaTeX is slower than direct manipulation. Graphic designers do not use LaTeX.

**Content-first writing without structure.** If you are drafting and the document structure is still fluid, the LaTeX approach of declaring structure upfront can feel premature. Many writers draft in a simpler format and migrate to LaTeX when the structure stabilises.


## How LaTeX Compares to the Alternatives

| | **LaTeX** | **Microsoft Word** | **Google Docs** | **Markdown** |
|---|---|---|---|---|
| **Learning curve** | Steep initially | Low | Very low | Low |
| **Mathematics** | Excellent | Adequate | Basic | Via extensions |
| **Long documents** | Excellent | Gets painful | Gets painful | Requires tooling |
| **Collaboration** | Overleaf helps | Strong | Excellent | Depends on tooling |
| **Reproducibility** | Excellent | Poor | Poor | Good |
| **Output quality** | Best in class | Good | Adequate | Varies |
| **Publisher requirements** | Required in many fields | Common in business | Rarely required | Common for web/docs |
| **Version control** | Plain text — excellent | Binary file — poor | Cloud only | Plain text — excellent |
| **Figures and tables** | Powerful but verbose | Easy | Easy | Limited |

The key insight from this table: LaTeX and Word are not competing for the same jobs. Word is optimised for collaborative business documents where WYSIWYG iteration matters. LaTeX is optimised for technical, mathematical, and long-form academic documents where precision, reproducibility, and structured output matter. The comparison that makes sense is not which is better — it is which is right for the document you are producing.

Markdown occupies a different niche: lightweight, plain-text, excellent for documentation, web content, and notes, but not designed for the typographic demands of a journal submission or thesis. Markdown and LaTeX are often complementary: notes and drafts in Markdown, final documents in LaTeX.


## The Common Objection: It's Too Complicated

The complication is real and front-loaded. The first time you run LaTeX and get a wall of error messages, it is not obvious what went wrong. The first time you try to place a figure where you want it, it doesn't go there. These experiences are frustrating.

The reason LaTeX retains its position despite this is that the frustration is mostly concentrated at the beginning. Once you understand the mental model — structure in, formatted output out, errors are usually in the source — the day-to-day experience of writing a long document in LaTeX is often smoother than managing the same document in a word processor.

The error messages improve once you know how to read them (Week 3 covers this). The figure placement makes sense once you understand LaTeX's floating environment model. The bibliography stops being mysterious once you see how BibTeX or BibLaTeX handles it.

The learning curve is real. So is the payoff for the kinds of work it is designed for.


## What You Have After This Week

After Week 1, you have the conceptual frame:

- LaTeX separates content from presentation — you describe structure, the engine handles layout
- It was built from first principles for typesetting quality, particularly for mathematics
- It is the right tool for long structured documents, mathematics-heavy content, and academic publishing in STEM fields
- It is not the right tool for everything, and choosing it when a simpler alternative fits is a mistake, not a virtue
- The minimal document structure: `\documentclass`, preamble, `\begin{document}`, content, `\end{document}`

Next week: getting LaTeX running on your machine (and the browser alternative if you'd rather not install anything). The week after that: document structure, packages, and reading error messages without guessing.
