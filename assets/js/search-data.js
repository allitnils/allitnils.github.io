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
          description: "Curriculum Vitae of Ivan Ocampo (Ph.D.) — Solutions Architect with expertise in cloud platforms, enterprise architecture, and data science.",
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
          description: "",
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
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
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
      },{id: "post-cybersecurity-in-a-connected-world",
        
          title: 'Cybersecurity in a Connected World <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://ivan-ocampo.medium.com/cybersecurity-in-a-connected-world-8e33d2e4200d?source=rss-eaef8062a2b8------2", "_blank");
          
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
