---
layout: page
title: CutWise
description: Browser-based cutting sheet optimiser that packs rectangular pieces onto plywood sheets with minimal waste, with PDF export and CSV import.
img: assets/img/11.jpg
importance: 3
category: completed
---

## Overview

**CutWise** is a zero-dependency, browser-native tool for optimising how rectangular pieces are laid out across standard plywood sheets (2440×1220mm default). It minimises material waste, respects grain direction, and exports print-ready PDFs — all without a server or install.

## Features

- **Sheet configuration**: Customisable sheet dimensions, kerf (blade width), and grain direction lock.
- **Named pieces with colour coding**: Each cut piece is uniquely coloured for at-a-glance identification across sheets.
- **CSV import**: Drag-and-drop or upload a cut list in `name,width,height,quantity` format.
- **Per-sheet visual layout**: Canvas-rendered layout with utilisation percentage per sheet.
- **PDF export**: Summary page followed by one scaled layout page per sheet.

## Algorithm

Uses **Guillotine Best-Area-Fit** packing:

1. Pieces are sorted largest-to-smallest by area.
2. Each piece is placed into the smallest free rectangle that fits it (best-area-fit heuristic).
3. The placed piece splits the free rectangle into two sub-rectangles (guillotine cut).
4. Contained sub-rectangles are pruned to keep the free-space list compact.
5. Pieces that don't fit the current sheet overflow to a new sheet automatically.
6. With grain direction off, both 0° and 90° orientations are evaluated per placement and the better fit is chosen.

## Stack

- **Languages**: HTML, CSS, JavaScript (vanilla — no build tools or frameworks)
- **Rendering**: Canvas API for layout visualisation
- **Export**: jsPDF for PDF generation
- **Hosting**: GitHub Pages

## Live App

[cutwise.ivanocampo.com](http://ivanocampo.com/CutWise/) — open in any modern browser, no install required.
