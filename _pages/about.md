---
layout: about
title: about
permalink: /
subtitle: 🎓 Ph.D. | 💻 IT Geek | 📖 Storyteller | ☕ Coffee Addict | 📚 Lifelong Learner
description: Ivan Ocampo (Ph.D.) is a Solutions Architect specialising in cloud infrastructure, enterprise architecture, TOGAF, and data science.

profile:
  align: right
  image: prof_pic.jpg
  image_circular: false

news: false
selected_papers: false
social: true

latest_posts:
  enabled: true
  scrollable: false
  limit: 3
---
I'm **Ivan Ocampo**, a technology professional specialising in architecture, infrastructure, business improvement and design. In my current role as a solutions architect, I design and optimise systems that support growing, scalable and efficient business operations. This work leverages my extensive technical knowledge in programming, cloud platforms, and data analysis to create robust solutions tailored to organisational needs. I apply **TOGAF** principles to structure this framework, ensuring a comprehensive and methodical approach.

#### 🔭 Current Projects
- **Claude Code Agentic Workflows:** Autonomous multi-agent software engineering system leveraging Claude's tool-use API. Orchestrates parallel sub-agents via structured JSON tool loops with permission-gated bash execution, context-window compression, and filesystem introspection — enabling autonomous, multi-step codebase modification with full rollback safety.

- **Observability Stack (Grafana · Loki · Prometheus):** Production-grade observability platform with Prometheus for metrics scraping and alerting, Loki for log aggregation via LogQL, and Grafana for unified dashboards correlating metrics and logs across distributed infrastructure.

#### 🏷️ Explore by Topic

<div class="post-tags mt-2 mb-3">
  {%- for tag in site.display_tags -%}
    <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}" class="badge rounded-pill text-decoration-none me-1" style="font-size:0.85rem; padding:0.4em 0.85em; background-color:var(--global-theme-color); color:var(--global-card-bg-color);">{{ tag }}</a>
  {%- endfor -%}
  {%- for cat in site.display_categories -%}
    <a href="{{ cat | slugify | prepend: '/blog/category/' | relative_url }}" class="badge rounded-pill text-decoration-none me-1" style="font-size:0.85rem; padding:0.4em 0.85em; background-color:var(--global-theme-color); color:var(--global-card-bg-color);">{{ cat }}</a>
  {%- endfor -%}
</div>

#### 💻 Skills

| Domain | Tools |
|---|---|
| Cloud & Architecture | AWS · Azure · Kubernetes · Docker · Terraform · TOGAF |
| Security & Networking | ISO 27001 · NIST CSF · CrowdStrike · Palo Alto · Splunk · Fortinet |
| Data & AI | Python · R · TensorFlow · PyTorch · scikit-learn · Power BI · Tableau |
| Observability | Prometheus · Grafana · Loki · New Relic · Splunk |
| Databases | PostgreSQL · MySQL · MongoDB · Oracle · Cassandra |
| Languages | Python · Ruby · Java · C/C++ · Shell · JavaScript |

#### 📫 How to Reach Me
- **Website:** [ivanocampo.com](https://ivanocampo.com)
- **Email:** [ivan@ivanocampo.com](mailto:ivan@ivanocampo.com)

#### 🧩 Connect with Me
Feel free to reach out for collaborations, projects, or just a friendly chat about data science, programming, and enterprise architecture!
