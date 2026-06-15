---
title: "TikZ and pgfplots: Publication-Quality Figures That Don't Break Your LaTeX Build"
description: "From first principles to production-ready diagrams: how to use TikZ and pgfplots correctly for journal and conference figures, including coordinate systems, styling architecture, common failure modes, and externalization for large documents."
pubDate: 2026-05-28
tags: [academic, automation]
category: academic
featured: false
---

Most researchers end up with TikZ the same way: a colleague's `.tex` file has a diagram, they copy the code, adjust a few numbers, and it works — until it doesn't. The real issues with TikZ at scale are not about syntax. They're about coordinate system choices that calcify into unmaintainable diagrams, style definitions scattered across files, compilation time that degrades a large thesis into a 40-second build, and pgfplots data pipelines that silently produce wrong plots when the CSV format changes.

This post covers the patterns that prevent those failures.


## Coordinate Systems: The Decision That Determines Everything Downstream

TikZ has four coordinate systems that look interchangeable but aren't. Using the wrong one forces ugly workarounds later.

**Cartesian (`(x,y)`)** — absolute coordinates in centimetres by default. Use for fixed-size geometric constructions where exact dimensions matter.

**Polar (`(angle:radius)`)** — degrees and distance. Use for circular diagrams, clock-face layouts, and anything radially symmetric.

**Relative (`+(dx,dy)` and `++(dx,dy)`)** — offset from the last-used point. Single `+` doesn't update the current point; `++` does. Use when you're tracing a path where absolute positions would require recalculation every time you adjust spacing.

**Named node anchors** — this is the correct choice for 90% of diagram work. Define nodes, reference their anchors.

```latex
\begin{tikzpicture}
  % Named nodes with anchors — diagram survives repositioning
  \node[draw, rectangle] (input)  at (0,0)   {Input};
  \node[draw, rectangle] (proc)   at (3,0)   {Process};
  \node[draw, rectangle] (output) at (6,0)   {Output};

  % Arrows reference anchors, not hard-coded coordinates
  \draw[->] (input.east)  -- (proc.west);
  \draw[->] (proc.east)   -- (output.west);

  % Branch: from south of proc to a note below
  \node[draw, dashed] (note) at (3,-1.5) {Error path};
  \draw[->, dashed] (proc.south) -- (note.north);
\end{tikzpicture}
```

The failure mode of hard-coded coordinates: you move `proc` from `(3,0)` to `(4,0)` and now every arrow that manually referenced `(3,0)` is wrong. Named anchors make repositioning safe.


## Style Architecture: Separating What From How

The single biggest readability problem in real TikZ code is interleaving content with style. This works for a figure with three nodes, and becomes unreadable at fifteen.

Define styles once, reference them everywhere. The canonical pattern for a paper with multiple diagrams:

```latex
% In your preamble or a shared styles file (e.g., tikzstyles.tex)
\tikzset{
  % Node styles
  block/.style = {
    draw, rectangle, rounded corners=2pt,
    minimum width=2.5cm, minimum height=0.9cm,
    align=center, font=\small
  },
  decision/.style = {
    draw, diamond, aspect=1.8,
    minimum width=2.5cm, minimum height=0.9cm,
    align=center, font=\small
  },
  io/.style = {
    draw, trapezium, trapezium left angle=70, trapezium right angle=110,
    minimum width=2cm, minimum height=0.8cm,
    align=center, font=\small
  },
  % Edge styles
  arrow/.style  = {->, thick, >=Stealth},
  darrow/.style = {<->, thick, >=Stealth, dashed},
  % Annotation style
  note/.style = {
    font=\scriptsize\itshape, text width=2.5cm, align=center
  },
}
```

Then figures become declarative:

```latex
\begin{tikzpicture}[node distance=1.8cm]
  \node[block]    (a) {Data ingestion};
  \node[decision] (b) [below of=a] {Valid?};
  \node[block]    (c) [below of=b] {Transform};
  \node[io]       (d) [below of=c] {Output};
  \node[block, fill=red!10] (e) [right=2cm of b] {Reject};

  \draw[arrow]  (a) -- (b);
  \draw[arrow]  (b) -- node[right] {Yes} (c);
  \draw[arrow]  (c) -- (d);
  \draw[arrow]  (b) -- node[above] {No}  (e);
\end{tikzpicture}
```

Changing the global look of every diagram in your document requires editing one `\tikzset` block.


## pgfplots: Data Plots That Match Your Document's Typography

The canonical mistake with pgfplots is treating it as a drop-in replacement for Excel or matplotlib. It isn't. pgfplots renders plots as native LaTeX, which means fonts, sizes, and line weights match the rest of your document — but it also means data must be structured correctly and plot parameters must be explicitly controlled.

### Setting up pgfplots for journal submissions

Most journals have strict requirements on figure width (single-column ≈ 88 mm, double-column ≈ 180 mm). Set this in pgfplots, not in the `\includegraphics` call after the fact.

```latex
\usepackage{pgfplots}
\pgfplotsset{
  compat=1.18,          % Always set; without this, behaviour changed between versions
  width=\linewidth,     % Fills the column; override per-plot when needed
  height=0.65\linewidth,
  tick label style={font=\small},
  label style={font=\small},
  legend style={font=\small, draw=none, fill=none},
  grid=major,
  grid style={line width=0.3pt, draw=gray!30},
  every axis/.append style={line width=0.6pt},
  cycle list name=color list,  % or define your own
}
```

The `compat=1.18` line is not optional. pgfplots has changed its axis scaling logic, tick placement, and `\addplot` default behaviour across versions. Without pinning, a collaborator on a different TeX distribution can produce visually different output from the same source.

### Plotting from CSV

Embedding raw data in LaTeX source is acceptable for small datasets. For anything larger, read from CSV:

```latex
\begin{tikzpicture}
\begin{axis}[
  xlabel={Iteration},
  ylabel={Loss},
  xmin=0, xmax=100,
  ymin=0,
  legend pos=north east,
]
  \addplot[blue, thick]
    table[x=iter, y=train_loss, col sep=comma] {data/training.csv};
  \addlegendentry{Training}

  \addplot[red, dashed, thick]
    table[x=iter, y=val_loss, col sep=comma] {data/training.csv};
  \addlegendentry{Validation}
\end{axis}
\end{tikzpicture}
```

**Failure mode:** the CSV has a header row that doesn't match the column names you pass to `x=` and `y=`. pgfplots will silently produce an empty plot — no error, no warning — if column names don't match. Always verify your CSV header against the `table` call before considering the figure done.

**Failure mode:** negative or zero values in log-scale axes. pgfplots will either crash or silently omit those points. Add `restrict y to domain=1e-6:1e3` (adjust bounds to your data) to clip gracefully rather than crash.

### Error bars and confidence intervals

```latex
\addplot+[
  error bars/.cd,
  y dir=both,
  y explicit,
] table[
  x=epoch,
  y=mean_acc,
  y error=std_acc,
  col sep=comma,
] {data/results.csv};
```

The `+` in `\addplot+` means "append to the current cycle list entry" rather than overriding it. Omit it and you lose the colour/marker assigned by the cycle list.

### Grouped bar charts

```latex
\begin{tikzpicture}
\begin{axis}[
  ybar,
  bar width=0.35cm,
  symbolic x coords={Method A, Method B, Method C, Method D},
  xtick=data,
  x tick label style={rotate=30, anchor=east, font=\small},
  ylabel={F1 Score},
  ymin=0.5, ymax=1.0,
  enlarge x limits=0.15,
  legend style={at={(0.5,1.03)}, anchor=south, legend columns=-1},
]
  \addplot coordinates {(Method A,0.82) (Method B,0.87) (Method C,0.79) (Method D,0.91)};
  \addplot coordinates {(Method A,0.79) (Method B,0.84) (Method C,0.76) (Method D,0.88)};
  \addlegendentry{Dataset 1}
  \addlegendentry{Dataset 2}
\end{axis}
\end{tikzpicture}
```

`enlarge x limits` controls the padding on the left and right of the first and last bar group. Without it, bars at the extremes clip against the axis frame.


## Neural Network and Architecture Diagrams with TikZ

Architecture diagrams are where researchers most often reach for PowerPoint instead. Don't. Vector diagrams from TikZ are resolution-independent, consistent with document fonts, and don't need manual re-export when you revise them.

The `neuralnetwork` and `tikz-network` packages exist but impose strong style opinions. For journal figures, defining layers manually gives better control:

```latex
\usetikzlibrary{positioning, arrows.meta}

\begin{tikzpicture}[
  node distance=1.2cm and 1.8cm,
  neuron/.style={circle, draw, minimum size=0.6cm, inner sep=0pt, font=\tiny},
  layer label/.style={font=\small\bfseries, above},
]
  % Input layer
  \foreach \i in {1,...,4} {
    \node[neuron] (I\i) at (0, {-(\i-2.5)*0.9}) {};
  }
  \node[layer label] at (0, 1.5) {Input};

  % Hidden layer
  \foreach \i in {1,...,6} {
    \node[neuron] (H\i) at (2.5, {-(\i-3.5)*0.9}) {};
  }
  \node[layer label] at (2.5, 2.4) {Hidden};

  % Output layer
  \foreach \i in {1,...,2} {
    \node[neuron] (O\i) at (5, {-(\i-1.5)*0.9}) {};
  }
  \node[layer label] at (5, 0.8) {Output};

  % Connections
  \foreach \i in {1,...,4} {
    \foreach \j in {1,...,6} {
      \draw[gray!50, line width=0.3pt] (I\i) -- (H\j);
    }
  }
  \foreach \i in {1,...,6} {
    \foreach \j in {1,...,2} {
      \draw[gray!60, line width=0.4pt] (H\i) -- (O\j);
    }
  }
\end{tikzpicture}
```

The `\foreach` loop is the key pattern. Adjusting layer width means changing one number, not repositioning every node and redrawing every edge.


## Externalization: Surviving Large Document Build Times

A thesis with 30 TikZ figures rebuilds every figure on every `pdflatex` run. At a few seconds per complex figure, this becomes the primary obstacle to iterating on text.

pgfplots ships with an externalization library. Enable it in your preamble:

```latex
\usepgfplotslibrary{external}
\tikzexternalize[prefix=figures/cache/]
```

Create the cache directory before the first build:

```bash
mkdir -p figures/cache
```

On first build, each figure compiles and writes a `.pdf` to the cache directory. Subsequent builds read the cached `.pdf` instead of re-rendering, unless the figure's source has changed.

**Failure mode:** externalization breaks when packages modify the output routine. Common culprits: `\tikzexternalize` placed after `hyperref`, or combined with `beamer`. The fix for `hyperref` is:

```latex
\usepackage{hyperref}
\usepackage{pgfplots}
\usepgfplotslibrary{external}
\tikzexternalize[prefix=figures/cache/]
```

Order matters. `hyperref` must load before `tikzexternalize`.

**Failure mode:** partial cache invalidation. If you rename a figure or change `\tikzsetnextfilename`, pgfplots will try to create a new cached file. Old cache files are not automatically deleted. For clean rebuilds: `rm -rf figures/cache/ && pdflatex ...`.

For CI pipelines or shared builds, commit the `figures/cache/` directory so collaborators don't pay the full rebuild cost on first checkout.


## Colour Consistency Across Figures

Journals increasingly enforce colour consistency between figures in the same paper. Defining colours once and referencing them by name prevents figures that use slightly different shades of "blue" because they were created at different times:

```latex
% In preamble
\usepackage{xcolor}
\definecolor{primary}{HTML}{2166AC}    % IBM accessible blue
\definecolor{secondary}{HTML}{D6604D}  % Accessible red-orange
\definecolor{accent}{HTML}{4DAC26}     % Accessible green
\definecolor{neutral}{HTML}{636363}    % Mid-grey

% Use in tikzset
\tikzset{
  highlight/.style = {draw=primary, fill=primary!15},
  danger/.style    = {draw=secondary, fill=secondary!15},
}

% Use in pgfplotsset
\pgfplotsset{
  cycle list={
    {primary,   mark=*, solid},
    {secondary, mark=square*, solid},
    {accent,    mark=triangle*, solid},
    {neutral,   mark=diamond*, dashed},
  },
}
```

With this setup, changing the primary blue across all figures in the document means changing one `\definecolor` line.


## Positioning Annotations Precisely

Annotations — arrows with labels pointing to specific features of a plot or diagram — are a common source of frustration. The `annotate` approach that works:

```latex
\begin{tikzpicture}
\begin{axis}[...]
  \addplot[...] {...};

  % Annotation: arrow from label text to data point
  \node[
    pin={[pin edge={->, thick}, pin distance=1.2cm]
         below right:{\small Phase transition}},
  ] at (axis cs:42, 0.73) {};
\end{axis}
\end{tikzpicture}
```

The `axis cs:` prefix is mandatory when referencing data coordinates inside a pgfplots environment. Without it, TikZ interprets the coordinates as centimetres, not data-space values, and your annotation ends up at a random position outside the plot.


## Common Build Failures and Fixes

| Symptom | Cause | Fix |
|---|---|---|
| `Dimension too large` | Axis range contains very large numbers (e.g., Unix timestamps) | Subtract baseline from data before plotting, or use `xtick scale label code` |
| Empty plot, no error | CSV column name mismatch | Print `\pgfplotstableread` to `\typeout` and verify headers |
| Blurry output in PDF | Using raster image inside TikZ figure | Replace with vector source or use `\includegraphics` correctly scaled |
| Different spacing in externalized vs inline | `\textwidth` differs in external job | Pass `\pdfpagewidth`/`\pdfpageheight` to external job via `\tikzset{external/system call=...}` |
| `pgfplots` and `beamer` clash | `beamer` redefines environments externalization depends on | Use `\tikzexternalize` with `beamer` only after `\begin{document}` |
| Legend overflow | Auto-placed legend overlaps data | Set `legend pos` explicitly or use `legend to name` to place legend outside axis |


## Recommendations for Thesis-Scale Documents

**Use a shared styles file.** Put all `\tikzset`, `\pgfplotsset`, and `\definecolor` definitions in `tikzstyles.tex` and `\input` it in the preamble. Do not define styles inline in figures.

**Enable externalization early.** The cost of retrofitting externalization to 30 finished figures is high. Enable it in the preamble on day one, even if figures are simple at first.

**Name every figure file explicitly.** Without `\tikzsetnextfilename{fig-model-architecture}`, pgfplots generates cache filenames based on sequence number. Inserting a new figure before figure 12 renames every subsequent cache file and invalidates the cache from that point forward.

```latex
\tikzsetnextfilename{fig-training-curves}
\begin{tikzpicture}
\begin{axis}[...]
  ...
\end{axis}
\end{tikzpicture}
```

**Keep data files in a `data/` subdirectory.** Tables of CSV data embedded in LaTeX source are hard to audit and impossible to version-diff meaningfully. Separate data from presentation; your figures become reproducible from raw output files.

**Test colour accessibility.** The default pgfplots colour cycle is not accessible to readers with colour vision deficiency. Use the IBM accessible colour palette (`#648FFF`, `#785EF0`, `#DC267F`, `#FE6100`, `#FFB000`) or the Paul Tol palettes, which are designed specifically for scientific figures.


The investment in setting up a proper TikZ and pgfplots style architecture pays off around figure ten. Before that it feels like overhead. After that, changing a font size or colour scheme across an entire paper's worth of figures takes thirty seconds instead of a morning.
