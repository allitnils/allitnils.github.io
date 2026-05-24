---
layout: page
title: Claude Code Agentic Workflows
description: Autonomous multi-agent software engineering system using Claude's tool-use API with parallel sub-agents, hook-driven automation, and persistent memory.
img: assets/img/10.jpg
importance: 1
category: work
---

## Overview

Agentic software engineering system leveraging Claude's multi-turn tool-use API. Orchestrates parallel sub-agents via structured JSON tool loops with permission-gated bash execution, context-window compression, and filesystem introspection. Implements a persistent memory layer, hook-driven automation, and worktree-isolated code changes — enabling autonomous, multi-step codebase modification with full rollback safety.

## Key Components

- **Multi-agent Orchestration**: Specialised sub-agents (Explore, Plan, Review) spawned in parallel and coordinated via message passing.
- **Tool Loop Architecture**: Structured JSON tool calls (Read, Edit, Bash, Write) with permission gating and sandboxed execution.
- **Persistent Memory**: File-backed memory system (user, feedback, project, reference types) loaded across sessions.
- **Hook-driven Automation**: Shell hooks wired to tool lifecycle events (pre/post file write, bash execution, session stop).
- **Worktree Isolation**: Git worktrees used for isolated, reversible code changes across parallel agents.
- **Context Compression**: Automatic summarisation and compaction to sustain long multi-turn sessions without context loss.

## Stack

- **Model**: Claude Sonnet / Opus via Anthropic API
- **Runtime**: Claude Code CLI
- **Languages**: Python, Bash, YAML
- **Infra**: Git worktrees, filesystem hooks, JSON tool schemas
