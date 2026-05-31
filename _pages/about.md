---
layout: about
title: about
permalink: /
subtitle: <a href="https://www.accentgroup.com.au" target="_blank">Accent Group</a> &mdash; Melbourne, Australia &mdash; Ph.D. | TOGAF | CCNP
description: Ivan Ocampo is Chief Architect at Accent Group, with expertise spanning enterprise architecture, cybersecurity, hybrid cloud infrastructure, observability, and applied AI.

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

Ivan Ocampo is Chief Architect at Accent Group (ASX: AX1), one of Australia's largest footwear and apparel retailers, operating 800+ stores across brands including Platypus, Hype DC, Vans, Timberland, and Dr Martens. His work spans enterprise and solution architecture, cybersecurity, hybrid cloud infrastructure, data platforms, and applied AI — covering both hands-on technical execution and executive governance.

He holds a TOGAF certification, a CCNP, and a PhD from the Australian Institute of Business. His doctoral research theorised and empirically validated liminal spaces as a mediating mechanism between remote work intensity and employee outcomes — work that informs how he thinks about technology-mediated work design and organisational change.

Before Accent Group, he held senior technical leadership roles at Peter MacCallum Cancer Centre, Australian Clinical Labs, and the Australian National University — accumulating 15+ years of experience across healthcare, higher education, and enterprise retail.

## Technical Competencies

| Domain | Platforms & Tools |
|---|---|
| Architecture & Governance | TOGAF, enterprise architecture, solution architecture, architecture review boards |
| Cloud & Infrastructure | Microsoft Azure, VMware vSphere, Windows Server, Active Directory, Microsoft 365 |
| Cybersecurity | CrowdStrike Falcon, Tenable, Splunk SIEM/SOAR, zero trust architecture |
| Networking | Cisco enterprise networking (CCNP), LAN/WAN, SD-WAN, DNS, VPN, firewall architecture |
| Data & Observability | Grafana, Prometheus, Loki, VictoriaMetrics, OpenTelemetry, Splunk |
| ITSM & Platforms | ITIL, Atlassian Jira/Confluence/JSM, GitHub/GitHub Actions |
| AI & Emerging Technology | Applied enterprise AI, AI integration architecture |

## Explore by Topic

<div class="post-tags mt-2 mb-3">
  {%- for tag in site.display_tags -%}
    <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}" class="badge rounded-pill text-decoration-none me-1" style="font-size:0.85rem; padding:0.4em 0.85em; background-color:var(--global-theme-color); color:var(--global-card-bg-color);">{{ tag }}</a>
  {%- endfor -%}
  {%- for cat in site.display_categories -%}
    <a href="{{ cat | slugify | prepend: '/blog/category/' | relative_url }}" class="badge rounded-pill text-decoration-none me-1" style="font-size:0.85rem; padding:0.4em 0.85em; background-color:var(--global-theme-color); color:var(--global-card-bg-color);">{{ cat }}</a>
  {%- endfor -%}
</div>

## Contact

Email: [ivan@ivanocampo.com](mailto:ivan@ivanocampo.com)
