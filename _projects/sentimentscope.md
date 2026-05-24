---
layout: page
title: SentimentScope
description: Real-time text analytics platform that captures, analyses, and visualises sentiment from social media and news streams.
img: assets/img/8.jpg
importance: 2
category: completed
---

## Overview

**SentimentScope** is a Shiny R application for real-time text analytics. It ingests text from social media and news sources, applies natural language processing pipelines, and surfaces sentiment trends, emerging topics, and tone shifts through interactive dashboards.

## Features

- **Sentiment Analysis**: Classifies text as positive, negative, or neutral using lexicon-based and ML models.
- **Trend Detection**: Tracks sentiment over time and identifies inflection points tied to specific events or keywords.
- **Topic Modelling**: Uses LDA to surface emerging themes across large document collections.
- **Interactive Dashboards**: Shiny-powered UI with real-time filtering by source, keyword, and date range.
- **Multi-source Ingestion**: Supports Twitter/X, RSS feeds, and custom text uploads.

## Stack

- **Language**: R
- **Framework**: Shiny
- **NLP**: `tidytext`, `quanteda`, `sentimentr`
- **Visualisation**: `ggplot2`, `plotly`, `wordcloud2`
