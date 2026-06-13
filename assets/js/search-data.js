// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-cv",
          title: "cv",
          description: "Curriculum Vitae of Ivan Ocampo (Ph.D.) — Chief Architect at Accent Group, with expertise in enterprise architecture, cybersecurity, hybrid cloud infrastructure, and observability.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "A growing collection of projects by Ivan Ocampo spanning cloud infrastructure, data science, machine learning, and enterprise architecture.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-publications",
          title: "publications",
          description: "Academic publications by Ivan Ocampo, listed by category in reverse chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "Open-source repositories and code projects by Ivan Ocampo.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-teaching",
          title: "teaching",
          description: "Course materials, schedules, and resources for classes taught at the Australian Institute of Business.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/teaching/";
          },
        },{id: "nav-blog",
          title: "blog",
          description: "Writing on enterprise architecture, cybersecurity, infrastructure, observability, and applied AI.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "post-practical-mcp-server-development-for-internal-tooling",
        
          title: "Practical MCP Server Development for Internal Tooling",
        
        description: "A deep, hands-on guide to building production MCP servers for internal engineering tooling — transport selection, the 2025-06-18 OAuth resource-server model, token-audience binding, tool design, and the confused-deputy failure mode that takes teams down.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/mcp-server-development-internal-tooling/";
          
        },
      },{id: "post-claude-code-as-an-orchestration-layer-across-multi-system-enterprise-environments",
        
          title: 'Claude Code as an Orchestration Layer Across Multi-System Enterprise Environments <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/claude-code-as-an-orchestration-layer-across-multi-system-enterprise-environments-32e8328f38a7?source=rss-eaef8062a2b8------2", "_blank");
          
        },
      },{id: "post-promql-optimisation-patterns-for-high-cardinality-environments",
        
          title: "PromQL Optimisation Patterns for High-Cardinality Environments",
        
        description: "Concrete PromQL optimisation techniques for platform engineers operating at high cardinality: label matchers, recording rules, histogram strategies, aggregation ordering, and failure modes that silently degrade query performance in production.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/promql-optimisation-high-cardinality/";
          
        },
      },{id: "post-claude-code-as-an-orchestration-layer-across-multi-system-enterprise-environments",
        
          title: "Claude Code as an Orchestration Layer Across Multi-System Enterprise Environments",
        
        description: "How Claude Code&#39;s sub-agent model, hook system, MCP integration, and worktree isolation compose into a production-grade orchestration layer for multi-system enterprise workflows — with architecture patterns, failure modes, and a practical implementation checklist.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/claude-code-enterprise-orchestration/";
          
        },
      },{id: "post-latex-masterclass-week-1-what-is-latex-and-why-it-matters",
        
          title: "LaTeX Masterclass Week 1: What Is LaTeX and Why It Matters",
        
        description: "A clear, honest introduction to LaTeX for researchers, PhD students, and technical writers: what it is, how it differs from Word and Google Docs, why typesetting quality matters, and when LaTeX is the right tool — and when it isn&#39;t.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/latex-masterclass-week-1-what-is-latex-and-why-it-matters/";
          
        },
      },{id: "post-security-and-credential-management-for-ai-agents-with-filesystem-and-api-access",
        
          title: "Security and Credential Management for AI Agents with Filesystem and API Access",
        
        description: "Concrete attack vectors, secrets management integration, filesystem sandboxing, agent identity patterns, and the production failure modes that credential-bearing AI agents introduce — written for engineers building or operating them.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/ai-agent-credential-security/";
          
        },
      },{id: "post-tikz-and-pgfplots-publication-quality-figures-that-don-39-t-break-your-latex-build",
        
          title: "TikZ and pgfplots: Publication-Quality Figures That Don&#39;t Break Your LaTeX Build",
        
        description: "From first principles to production-ready diagrams: how to use TikZ and pgfplots correctly for journal and conference figures, including coordinate systems, styling architecture, common failure modes, and externalization for large documents.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/tikz-pgfplots-publication-quality-figures/";
          
        },
      },{id: "post-opentelemetry-migration-in-production-trade-offs-every-platform-team-gets-wrong",
        
          title: "OpenTelemetry Migration in Production: Trade-offs Every Platform Team Gets Wrong",
        
        description: "Concrete collector topology decisions, SDK migration patterns, tail sampling configuration, cardinality budget management, and rollback architecture for teams migrating from proprietary agents to OpenTelemetry in Kubernetes production environments.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/opentelemetry-migration-production/";
          
        },
      },{id: "post-mcp-server-architecture-and-tool-chaining-in-production-agentic-workflows",
        
          title: "MCP Server Architecture and Tool Chaining in Production Agentic Workflows",
        
        description: "Beyond the demo — concrete patterns for MCP server design, tool chaining economics, idempotency, and the architectural trade-offs that determine whether an agentic workflow survives production.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/mcp-tool-chaining-production/";
          
        },
      },{id: "post-thesis-writing-in-latex",
        
          title: 'Thesis Writing in LaTeX <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/thesis-writing-in-latex-3e0d587f3b5d?source=rss-eaef8062a2b8------2", "_blank");
          
        },
      },{id: "post-why-the-return-to-office-push-reveals-a-bigger-management-crisis",
        
          title: 'Why the Return-to-Office Push Reveals a Bigger Management Crisis <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/why-the-return-to-office-push-reveals-a-bigger-management-crisis-0e1c653ffa45?source=rss-eaef8062a2b8------2", "_blank");
          
        },
      },{id: "post-the-kintsugi-way-celebrating-imperfection-in-life-s-transitional-spaces",
        
          title: 'The Kintsugi Way: Celebrating Imperfection in Life’s Transitional Spaces <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/the-kintsugi-way-celebrating-imperfection-in-lifes-transitional-spaces-953fc7ec940b?source=rss-eaef8062a2b8------2", "_blank");
          
        },
      },{id: "post-neuralink-bridging-science-fiction-and-reality-a-deep-dive-into-the-brain-computer-interface",
        
          title: 'Neuralink: Bridging Science Fiction and Reality. A Deep Dive into the Brain-Computer Interface... <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/neuralink-bridging-science-fiction-and-reality-a-deep-dive-into-the-brain-computer-interface-e8122d08dbc3?source=rss-eaef8062a2b8------2", "_blank");
          
        },
      },{id: "post-embracing-the-blank-page-a-journey-through-reluctant-writing",
        
          title: 'Embracing the Blank Page: A Journey Through Reluctant Writing <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/embracing-the-blank-page-a-journey-through-reluctant-writing-825e23b174af?source=rss-eaef8062a2b8------2", "_blank");
          
        },
      },{id: "post-top-10-philosophical-musings-and-life-lessons-from-the-world-of-phdcomics-com",
        
          title: 'Top 10 Philosophical Musings and Life Lessons from the World of PhDComics.com <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/top-10-philosophical-musings-and-life-lessons-from-the-world-of-phdcomics-com-3782f9bbaed4?source=rss-eaef8062a2b8------2", "_blank");
          
        },
      },{id: "post-are-your-excuses-stopping-you-from-achieving-your-dreams",
        
          title: 'Are Your Excuses Stopping You from Achieving Your Dreams? <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/are-your-excuses-stopping-you-from-achieving-your-dreams-8cdfb4abc6e9?source=rss-eaef8062a2b8------2", "_blank");
          
        },
      },{id: "post-navigating-liminal-spaces-finding-inspiration-in-jon-fosse-s-triumph-over-adversity",
        
          title: 'Navigating Liminal Spaces: Finding Inspiration in Jon Fosse’s Triumph Over Adversity <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/navigating-liminal-spaces-finding-inspiration-in-jon-fosses-triumph-over-adversity-90bd9b714d8c?source=rss-eaef8062a2b8------2", "_blank");
          
        },
      },{id: "post-the-top-10-hacking-movies-of-all-time",
        
          title: 'The Top 10 Hacking Movies of All Time <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/the-top-10-hacking-movies-of-all-time-cbbbcb92bf26?source=rss-eaef8062a2b8------2", "_blank");
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-a-simple-inline-announcement",
          title: 'A simple inline announcement.',
          description: "",
          section: "News",},{id: "news-a-long-announcement-with-details",
          title: 'A long announcement with details',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_2/";
            },},{id: "news-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "News",},{id: "projects-claude-code-agentic-workflows",
          title: 'Claude Code Agentic Workflows',
          description: "Autonomous multi-agent software engineering system using Claude&#39;s tool-use API with parallel sub-agents, hook-driven automation, and persistent memory.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/claude_code/";
            },},{id: "projects-cutwise",
          title: 'CutWise',
          description: "Browser-based cutting sheet optimiser that packs rectangular pieces onto plywood sheets with minimal waste, with PDF export and CSV import.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/cutwise/";
            },},{id: "projects-observability-stack",
          title: 'Observability Stack',
          description: "Full-stack observability platform built on Prometheus, Loki, and Grafana for unified metrics, logs, and alerting across distributed infrastructure.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/observability/";
            },},{id: "projects-sentimentscope",
          title: 'SentimentScope',
          description: "Real-time text analytics platform that captures, analyses, and visualises sentiment from social media and news streams.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/sentimentscope/";
            },},{id: "teachings-business-analysis-for-managers",
          title: 'Business Analysis for Managers',
          description: "A practical course in business analysis for managers, covering requirements elicitation, process modelling, stakeholder engagement, and data-driven decision-making within an enterprise context.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/business-analysis-for-managers/";
            },},{id: "teachings-cybersecurity-for-managers",
          title: 'Cybersecurity for Managers',
          description: "A management-level course in cybersecurity, covering risk frameworks, governance, threat landscapes, incident response, and regulatory compliance for non-technical leaders.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/cybersecurity-for-managers/";
            },},];
