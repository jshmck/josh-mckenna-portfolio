# Agency Packs

Third-party agent packs adapted for this project from [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents).

## Philosophy

Agency packs are **isolated, opt-in** extensions that add specialized capabilities without cluttering the core configuration. They:

- Live in a separate namespace from core agents
- Include project-specific customizations (design system, MCP tools, workflow integration)
- Can be activated on-demand via `/use-pack`
- Stay dormant until explicitly invoked

## Available Packs

| Pack | Agent | Purpose |
|------|-------|---------|
| `a11y` | Accessibility Auditor | WCAG 2.2 AA compliance, screen reader testing, React Aria validation |
| `perf` | Performance Benchmarker | Core Web Vitals, Lighthouse automation, bundle analysis |
| `security` | Security Engineer | Threat modeling, secure code review, OWASP Top 10 |
| `database` | Database Optimizer | Supabase/PostgreSQL query analysis, index optimization |
| `ux` | UX Researcher | User testing frameworks, feedback synthesis, persona development |

## Usage

### Activate a Pack

```
/use-pack a11y
```

This loads the pack's agent into your current session with full project context.

### Direct Reference

You can also reference pack agents directly:

> "Use the accessibility auditor to review this component for WCAG compliance"

## Pack Structure

```
agency-packs/
├── README.md                    # This file
├── manifest.yaml                # Pack registry and configuration
├── a11y/
│   ├── accessibility-auditor.md # Project-customized agent
│   └── manifest.yaml            # Pack-specific config
├── perf/
│   ├── performance-benchmarker.md
│   └── manifest.yaml
├── security/
│   ├── security-engineer.md
│   └── manifest.yaml
├── database/
│   ├── database-optimizer.md
│   └── manifest.yaml
└── ux/
    ├── ux-researcher.md
    └── manifest.yaml
```

## Project Customizations

Every imported agent includes:

1. **Design System Rules**: CSS syntax, color palette, border patterns
2. **Component Standards**: React Aria, devProps requirements
3. **MCP Tool Awareness**: Supabase, Vercel, Figma, GitHub, Firecrawl
4. **Workflow Integration**: KARIMO, feature-dev, incremental commits
5. **Forbidden Elements**: No Sparkles icon, no thick borders

## Adding New Packs

1. Find a suitable agent from [agency-agents](https://github.com/msitarzewski/agency-agents)
2. Create a new directory under `agency-packs/`
3. Adapt the agent with project-specific rules (use existing packs as templates)
4. Add pack metadata to `manifest.yaml`
5. Test the agent on a real task

## Source Attribution

Agents are adapted from [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) under MIT license. Original authors retain credit for the core agent designs.
