---
title: "Practical MCP Server Development for Internal Tooling"
description: "A deep, hands-on guide to building production MCP servers for internal engineering tooling — transport selection, the 2025-06-18 OAuth resource-server model, token-audience binding, tool design, and the confused-deputy failure mode that takes teams down."
pubDate: 2026-06-13
tags: [agentic-ai, security, architecture]
category: architecture
featured: false
---

The Model Context Protocol quickstart gets you a working tool server in about fifteen lines. That is not the problem. The problem is everything between that demo and a server that fronts your CI system, your incident tooling, or your cloud control plane without becoming the single most over-privileged process in your estate.

This post is about that gap, specifically for **internal tooling** — the servers that wrap the systems your engineers already have credentials to, and that an agent now wants to drive on their behalf. The threat model is different from a public MCP server, the credential handling is harder, and the failure modes are quieter. If you have built an MCP server and watched it work in `claude` or your IDE, this is the next layer.

Reference point throughout is the **2025-06-18 MCP specification** — the revision that pinned down the authorization model as a proper OAuth 2.1 resource server with RFC 8707 resource indicators. If your mental model of MCP auth is "pass an API key in env", it is two revisions out of date and structurally unsafe for the multi-tenant internal case.


## 1. The decision that frames everything: transport

Before any tool design, you choose a transport. This is not a cosmetic choice — it determines your entire security boundary, your credential model, and whether the server is single-user or multi-tenant.

| | **stdio** | **Streamable HTTP** |
|---|---|---|
| Process model | Child process per client | Long-lived shared service |
| Identity | Inherits the launching user | Per-request bearer token |
| Credentials | From environment (spec §STDIO) | OAuth 2.1 resource server |
| Tenancy | Single user, single trust domain | Multi-tenant |
| Network surface | None (pipe) | HTTPS endpoint |
| Right for | Local dev tools, per-laptop wrappers | Shared internal platforms |

The spec is explicit about this split. For stdio, the 2025-06-18 authorization section says implementations **SHOULD NOT** follow the OAuth flow and **instead retrieve credentials from the environment**. For HTTP-based transports, they **SHOULD** conform to the full OAuth resource-server spec.

The mistake teams make is reaching for HTTP because it "feels like a real service", then bolting a static shared API key onto it. You have now built the worst of both: a network-exposed endpoint with none of the audience-binding guarantees the HTTP transport exists to provide. **If you are HTTP, you are an OAuth 2.1 resource server. There is no defensible middle.**

A useful rule for internal tooling:

- **One engineer, one laptop, their own credentials** → stdio. The agent runs as them, inherits their `~/.aws/credentials` or `kubectl` context, and the OS is your boundary.
- **A shared capability multiple people's agents call** → Streamable HTTP with per-user tokens. The server must never hold a credential more privileged than the least-privileged caller.


## 2. Architecture of an internal MCP server

Here is the shape of a production internal server fronting an enterprise system, with the trust boundaries drawn explicitly.

```mermaid
flowchart TB
    subgraph Client Trust Domain
        A[Agent / Host<br/>Claude Code, IDE]
        AC[MCP Client]
        A --> AC
    end

    subgraph Server Trust Domain
        RS[MCP Server<br/>OAuth 2.1 Resource Server]
        TV[Token Validator<br/>audience + scope check]
        TM[Tool Layer<br/>schema-validated]
        EX[Per-user credential<br/>exchange / broker]
        RS --> TV --> TM --> EX
    end

    subgraph Identity Plane
        AS[Authorization Server<br/>Entra ID / Okta]
    end

    subgraph Downstream Systems
        D1[CI / Jenkins]
        D2[Cloud control plane]
        D3[Incident / Jira]
    end

    AC -->|Bearer token<br/>aud = this server| RS
    AC -.->|OAuth 2.1 + PKCE<br/>resource=canonical URI| AS
    AS -.->|access token| AC
    EX -->|separate upstream token| D1 & D2 & D3
    TV -.->|401 + WWW-Authenticate| AC
```

The two boxes that do the real work are the **token validator** and the **credential exchange**. Everything else is plumbing. Note the dashed line that does *not* exist: there is no arrow forwarding the client's token to a downstream system. That absence is the single most important property of the design, and §6 is about what happens when it shows up.


## 3. Building the server: stdio first

Start with the simple case to fix the tool-design fundamentals. A FastMCP (Python) server wrapping an internal deployment tool:

```python
# deploy_mcp.py
from mcp.server.fastmcp import FastMCP
import subprocess, shlex

mcp = FastMCP("internal-deploy")

@mcp.tool()
def list_environments() -> list[str]:
    """List deployable environments the caller has access to.
    Read-only. Safe to call without confirmation."""
    out = subprocess.run(
        ["deployctl", "env", "list", "--format=json"],
        capture_output=True, text=True, check=True,
    )
    return out.stdout

@mcp.tool()
def trigger_deploy(service: str, environment: str, sha: str) -> dict:
    """Trigger a deployment of `service` at git `sha` to `environment`.
    MUTATING. Caller must confirm. `environment` must be one of the
    values returned by list_environments. `sha` must be a 40-char hex."""
    if not _is_sha(sha):
        raise ValueError(f"sha must be a 40-char hex commit, got: {sha!r}")
    if environment == "production":
        # Hard gate. The model does not get to talk us out of this.
        raise PermissionError(
            "production deploys are not permitted via this tool")
    cmd = ["deployctl", "deploy",
           "--service", service, "--env", environment, "--sha", sha]
    out = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return {"status": "triggered", "log": out.stdout}
```

Run it locally:

```bash
# stdio transport — the agent launches this as a child process
uv run deploy_mcp.py

# wire it into Claude Code
claude mcp add internal-deploy -- uv run /opt/tools/deploy_mcp.py

# verify the handshake and tool list without an agent in the loop
npx @modelcontextprotocol/inspector uv run /opt/tools/deploy_mcp.py
```

Four design rules are already visible, and they matter more than the transport:

1. **The tool description is a security control, not documentation.** The model reads `MUTATING. Caller must confirm` and behaves accordingly. But — per the spec's own Tool Safety principle — *descriptions are untrusted to the host unless the server is trusted*. Never rely on the description as your *only* gate. The `if environment == "production"` check is the real boundary; the docstring is a hint.
2. **Validate every argument as if the caller is adversarial.** It effectively is — the arguments are produced by a language model that may have been prompted by content it ingested three tool-calls ago. `_is_sha()` is not paranoia; it is the difference between a deploy and a shell injection.
3. **Constrain the action space at the tool boundary, not in the prompt.** "Don't deploy to prod" in a system prompt is a suggestion. `raise PermissionError` is a contract.
4. **Separate read tools from write tools** with distinct, narrow signatures. This lets the host apply different consent policies and lets you grant `list_*` broadly while gating `trigger_*`.


## 4. Going multi-tenant: the HTTP resource server

The moment two engineers' agents share one server, stdio's "inherit the user" model collapses and you owe the full 2025-06-18 authorization flow. The server becomes an OAuth 2.1 **resource server**: it does not authenticate users, it *validates tokens minted by your IdP* (Entra ID, Okta, Auth0).

The discovery dance the spec mandates:

```http
# 1. Client calls with no token
GET /mcp HTTP/1.1
Host: mcp.internal.example.com

# 2. Server refuses and points at its metadata (RFC 9728)
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata=
  "https://mcp.internal.example.com/.well-known/oauth-protected-resource"

# 3. Client fetches protected-resource metadata
GET /.well-known/oauth-protected-resource HTTP/1.1
# → { "authorization_servers": ["https://login.example.com"],
#     "resource": "https://mcp.internal.example.com/mcp" }

# 4. Client runs OAuth 2.1 + PKCE against the AS, crucially sending:
#    resource=https://mcp.internal.example.com/mcp   (RFC 8707)

# 5. Client retries with an audience-bound token
GET /mcp HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

The non-negotiable server-side validation, distilled from the spec's Token Handling and Access Token Privilege Restriction sections:

```python
import jwt
from jwt import PyJWKClient

CANONICAL_URI = "https://mcp.internal.example.com/mcp"
jwks = PyJWKClient("https://login.example.com/.well-known/jwks.json")

def validate_token(authorization: str) -> dict:
    if not authorization.startswith("Bearer "):
        raise Unauthorized()                     # 401
    token = authorization.removeprefix("Bearer ")
    signing_key = jwks.get_signing_key_from_jwt(token).key
    claims = jwt.decode(
        token, signing_key,
        algorithms=["RS256"],
        audience=CANONICAL_URI,        # <-- the whole point. RFC 8707.
        issuer="https://login.example.com",
        options={"require": ["exp", "aud", "iss"]},
    )
    return claims                                 # scopes drive authz next
```

That `audience=CANONICAL_URI` line is the load-bearing wall of internal MCP security. The spec states it three times in three different sections because it is the boundary attackers go after:

> MCP servers **MUST** validate that access tokens were issued specifically for them as the intended audience… MCP servers **MUST NOT** accept or transit any other tokens.

A server that skips audience validation will happily accept *any* valid token your IdP issued — a token your colleague's agent obtained for the Jira MCP server now works against your cloud-control-plane MCP server. You have collapsed every internal service into one trust domain through the back door.


## 5. Credential exchange: the hard part nobody demos

Here is the question that separates a toy from a platform: **the agent's token authorises it to talk to *your server*. What credential does your server use to talk to the downstream system?**

The spec is blunt about the wrong answer:

> If the MCP server makes requests to upstream APIs… The MCP server **MUST NOT** pass through the token it received from the MCP client.

So you cannot forward the client token. You also must not hold one fat service-account credential and act on it for everyone — that is how a "summarise my open Jira tickets" tool becomes a lateral-movement primitive that reads *everyone's* tickets. Three viable patterns, in increasing order of safety:

**Pattern A — Broker per-user downstream tokens (OAuth token exchange, RFC 8693).** The server exchanges the inbound token for a downstream token scoped to *that user's* identity at the downstream system. The downstream API enforces the real authorization. This is the correct answer for internal tooling and the one worth the engineering.

```python
def downstream_token_for(claims: dict, downstream: str) -> str:
    # RFC 8693 token exchange against your IdP
    resp = httpx.post(TOKEN_ENDPOINT, data={
        "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
        "subject_token": _service_assertion(),   # server proves itself
        "requested_token_use": "on_behalf_of",
        "audience": downstream,                   # e.g. the CI API
        "scope": _minimal_scope_for(claims),      # never more than needed
    })
    return resp.json()["access_token"]
```

**Pattern B — Per-user secrets from a vault, keyed by validated subject.** If the downstream cannot do token exchange, store per-user credentials in a secrets manager and fetch them *keyed by the `sub` claim you just validated* — never by an identity the model supplied. The model never sees the secret; it only sees tool results.

**Pattern C — Scoped service account with caller attribution.** Last resort. One service account, but its permissions are the *intersection* of what any caller should have, every downstream call carries the caller's identity for audit, and you accept that you cannot enforce per-user authorization at the downstream. Only acceptable when the downstream is itself low-privilege and read-mostly.

What all three forbid: the model never holds a long-lived secret, secrets never appear in tool *arguments* (they would land in the model's context and your logs), and downstream credentials are minted as late and as narrowly as possible.

A credential-handling checklist for the server process itself:

- Secrets injected at runtime (vault, workload identity) — never in the image, repo, or `env` block of a committed config.
- Tool **arguments and results are logged**; assume it. Therefore no credential, token, or secret ever transits a tool boundary as a value.
- Downstream tokens short-lived (minutes), audience-bound, minimal scope.
- The server's own identity (Pattern A/B) is a workload identity, not a human's.


## 6. Production failure mode: the confused deputy

This is the one that takes teams down, and it is subtle because every component is behaving "correctly".

**The setup.** You build an internal MCP server that fronts three systems: GitHub, your cloud control plane, and PagerDuty. To keep things simple, the server holds a single OAuth client registration and a static client ID, and proxies authorization to each downstream's OAuth server on demand. Engineers' agents connect, consent once, and it works beautifully in the demo.

**The failure.** Because the proxy uses a *static client ID* and the downstream authorization servers have already seen a consent for that client, a subsequent authorization request can be auto-approved **without the user actually consenting to this specific flow**. An attacker who can get a victim's agent to follow a crafted authorization URL — via a poisoned tool description, a malicious repo README the agent reads, an injected issue comment — can obtain an authorization code minted under your server's trusted client identity. The downstream AS sees a request from a client it trusts and skips the consent screen. The attacker redeems the code. Your MCP server is now the confused deputy: it holds downstream access it was tricked into acquiring, and it cannot tell the difference between that and a legitimate session.

The spec calls this out directly:

> MCP proxy servers using static client IDs **MUST** obtain user consent for each dynamically registered client before forwarding to third-party authorization servers.

**Why internal tooling makes it worse.** The downstream systems are high-value (your cloud control plane), the agents routinely ingest untrusted content (issues, PRs, logs, ticket bodies) that can carry the injection, and the blast radius is your production estate. The same prompt-injection that is merely annoying on a public summariser is a credential-theft chain here.

**The mitigations, in order:**

1. **Do not build a proxy server with a static client ID** unless you implement per-client consent. This is the direct spec requirement.
2. **Audience-bind every token (RFC 8707) and validate it (§4).** A stolen code for downstream A cannot be replayed against downstream B.
3. **Treat all model-supplied content as a possible injection vector.** Tool descriptions, resource contents, and prior tool outputs are untrusted input. The mutating-action gates from §3 are your backstop when injection succeeds anyway.
4. **Short token lifetimes and refresh-token rotation** (spec, public clients) bound the damage window.
5. **Log the `sub`, the `aud`, and the downstream identity on every call.** When this happens — and across an org it will be attempted — you need to reconstruct which identity did what against which system. If your audit trail is "the service account did it", you have no investigation.


## 7. Architectural trade-offs

No design choice here is free. The ones worth stating plainly:

**Granular tools vs. broad tools.** Many narrow, single-purpose tools (`list_envs`, `get_deploy_status`, `trigger_deploy`) give the host precise consent control and shrink each tool's blast radius, but they inflate the tool count, and every tool's schema burns context-window tokens on every request. A handful of broad tools with a `command` enum is cheaper per call and far harder to reason about for safety. **Bias narrow for mutating capabilities, broad for read-only queries.** The consent granularity is worth more on the write path.

**stdio simplicity vs. HTTP shareability.** stdio gives you OS-level isolation, the user's own credentials, and zero token-validation code — but one server per laptop, no central policy, no central audit. HTTP gives you one place to enforce policy and observe everything, at the cost of becoming a network-exposed OAuth resource server with all the validation burden that implies. Most orgs end up with both: stdio for personal dev wrappers, HTTP for shared platform capabilities. Resist the urge to make the dev wrappers HTTP "for consistency".

**Token exchange (Pattern A) vs. service account (Pattern C).** Token exchange is the correct, auditable, least-privilege answer and it is real work — IdP configuration, RFC 8693 support, downstream apps that accept exchanged tokens. The service account is an afternoon and a latent incident. The honest trade is *engineering time now vs. an unbounded authorization story later*. For anything touching production systems, pay it now.

**Stateful sessions vs. stateless requests.** The spec allows long-lived stateful connections, but every HTTP request still **MUST** carry the bearer token — there is no "we authenticated at session start" shortcut. Stateless-per-request validation is more CPU but lets you horizontally scale the server and revoke instantly. For internal tooling, prefer stateless validation; the latency cost of a JWT verify is noise next to a deploy.


## 8. Implementation checklist

Transport and identity:

- [ ] Chosen transport matches tenancy: stdio for single-user, Streamable HTTP for shared.
- [ ] HTTP servers implement RFC 9728 protected-resource metadata at `/.well-known/oauth-protected-resource`.
- [ ] `401` responses carry a `WWW-Authenticate` header pointing at that metadata.
- [ ] Tokens validated on **every** request: signature, `iss`, `exp`, and `aud == canonical server URI`.
- [ ] Server rejects any token not audience-bound to it (no "valid token from our IdP" acceptance).

Tool design:

- [ ] Read tools and write tools are separate, narrowly typed, and individually described.
- [ ] Every argument is schema-validated and range/format-checked before use.
- [ ] Mutating and destructive actions have a hard gate in code, not just a docstring warning.
- [ ] No tool accepts or returns a credential, token, or secret as a value.
- [ ] High-risk actions (prod, delete, IAM) are blocked or require an out-of-band approval.

Credentials and downstream:

- [ ] The client's inbound token is **never** forwarded to a downstream system.
- [ ] Downstream access uses token exchange (A), vault-keyed-by-`sub` secrets (B), or a least-privilege attributed service account (C) — in that order of preference.
- [ ] Server identity is a workload identity; no human or admin credential in the process.
- [ ] Downstream tokens are short-lived, minimally scoped, and minted per-call.

Resilience and audit:

- [ ] No proxy server with a static client ID without per-client consent (confused-deputy gate).
- [ ] All model-supplied content (descriptions, resource bodies, prior outputs) treated as untrusted.
- [ ] Every call logs `sub`, `aud`, tool name, and downstream identity — never argument secrets.
- [ ] Refresh-token rotation enabled for public clients; access tokens short-lived.
- [ ] Server tested with `@modelcontextprotocol/inspector` before any agent is wired in.


## Closing

The reason MCP servers for internal tooling are deceptively hard is that the easy version works. It demos, it ships, and it sits in production looking healthy right up until a poisoned issue comment turns a convenience wrapper into a credential-exchange chain. The 2025-06-18 authorization model — resource-server validation, RFC 8707 audience binding, the explicit prohibition on token passthrough — is not bureaucratic ceremony. It is the accumulated scar tissue of exactly the failure modes above, written down as MUSTs.

Build the stdio version to get the tool design right. Build the HTTP version as a real resource server or not at all. And draw the one arrow that should never exist — client token to downstream system — only to confirm, every time, that it isn't there.
