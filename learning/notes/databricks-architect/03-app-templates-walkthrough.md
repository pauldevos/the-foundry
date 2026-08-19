# Databricks Apps template walkthrough

## Why this is the next study unit

The Databricks `app-templates` repository is a more useful learning surface than a service-by-service documentation tour because it shows how the pieces are composed into deployable applications. The repository is code truth for template mechanics: application entrypoints, resource declarations, environment variables, identity boundaries, local development, and deployment. Documentation remains the source of truth for product behavior, limits, and supported versions.

The local checkout at `/Users/devos/github/app-templates` is aligned with Databricks upstream `main` at commit `3253b78` (August 13, 2026). Treat the exact commit used in a lab as part of the lab record; templates evolve.

## The mental model: four contracts in every template

Before reading application code, identify these contracts:

| Contract | File or location | Question it answers |
| --- | --- | --- |
| Scaffold contract | `manifest.yaml` | What does `databricks apps init` generate and which inputs are required? |
| Runtime contract | `app.yaml` | What command starts the app, which environment variables are injected, and which port/health behavior is expected? |
| Deployment contract | `databricks.yml` | Which app, jobs, pipelines, experiments, serving endpoints, warehouses, volumes, or databases are deployed and granted to the app? |
| Application contract | `client/`, `server/`, `app.py`, or `agent_server/` | How does a request become a Databricks SDK/AppKit/SQL/model/Lakebase operation? |

For AppKit projects add a fifth contract: `appkit.plugins.json`. It maps a plugin to a Databricks resource and to the environment variables consumed by the server. A plugin declaration is not merely UI configuration; it is part of the application's authorization boundary.

## Recommended learning order

Do not read all templates alphabetically. Read them as a sequence of architectural decisions.

### 1. Runtime and framework comparisons

Start with `streamlit-hello-world-app`, `dash-hello-world-app`, `gradio-hello-world-app`, `shiny-hello-world-app`, `flask-hello-world-app`, and `nodejs-fastapi-hello-world-app`.

The goal is not to learn Streamlit or React. For each template, answer: what is the process entrypoint, how is the port selected, what does the app service principal receive, and how does the bundle differ between a one-process Python app and a Node/Python app?

### 2. One-resource application patterns

Read `appkit-files`, `appkit-analytics`, `appkit-genie`, `appkit-serving`, and `appkit-lakebase`.

Each template isolates one integration:

- **Files**: Unity Catalog Volume access and file operations.
- **Analytics**: SQL warehouse access and query-driven UI.
- **Genie**: a Genie space plus the `dashboards.genie` user scope.
- **Serving**: model serving endpoint access and the `serving.serving-endpoints` user scope.
- **Lakebase**: managed Postgres connection, schema/data ownership, and connection pooling.

For each, trace one button from browser to server route to the AppKit plugin to the declared resource in `databricks.yml`. Then remove the resource grant and observe the failure. That negative test is more memorable than a second successful deploy.

### 3. Composition

Read `appkit-all-in-one`. This is the best first template for understanding an application shell that combines analytics, files, Genie, Lakebase, and server functionality.

The critical code path is:

```ts
createApp({
  plugins: [analytics(), files(), genie(), lakebase(), server()],
  async onPluginsReady(appkit) {
    await setupSampleLakebaseRoutes(appkit);
  },
});
```

The client uses React Router for pages such as `/analytics`, `/lakebase`, `/genie`, and `/files`. The bundle declares the corresponding resources and privileges. This gives you a repeatable pattern for adding a new capability: add a plugin, add its scope/resource, add a route, then test both authorization paths.

### 4. Chat and agent applications

Read `e2e-chatbot-app-next`, `agent-langgraph`, `agent-openai-agents-sdk`, `agent-openai-agents-sdk-multiagent`, `agent-non-conversational`, and `agent-migration-from-model-serving`.

These answer different questions:

- How does a browser chat client call a deployed agent or model endpoint?
- What is the difference between a model-serving endpoint and an MLflow `ResponsesAgent`?
- Where do conversation state, user identity, and feedback live?
- How are multiple agents authorized and routed?
- What must change when migrating an existing Model Serving agent?

Then read `agent-langgraph-advanced`. It adds Lakebase checkpointers, long-term memory, background work, `@invoke`/`@stream` handlers, and MLflow tracing. The key architecture boundary is that an App request is short-lived, while background mode and durable memory require explicitly designed storage and polling behavior.

### 5. Retrieval and tool integration

Read `rag-chat` and the two MCP templates.

`rag-chat` is intentionally a comparison lab, not a synonym for AI Search. It stores chunks and embeddings in Lakebase Postgres with a `VECTOR(1024)` column, keeps chat history in Lakebase, and calls Databricks model/embedding endpoints. Compare that implementation with an AI Search index over governed Delta data. Record retrieval quality, freshness, filtering, latency, operational burden, and portability on the same golden questions.

`mcp-server-open-api-spec` shows a different boundary: an OpenAPI document is stored in a Unity Catalog Volume, an HTTP connection holds API authentication, and the App exposes generated MCP tools. The app name beginning with `mcp-` is part of the AI Playground discovery convention. This is an excellent lab for separating user authorization, app service-principal authorization, and downstream API authorization.

### 6. End-to-end showcases

Finish with `content-moderator`, `inventory-intelligence`, `agentic-support-console`, `saas-tracker`, and `vacation-rentals`.

These are architecture studies rather than syntax studies. Read the bundle first, then the server and client. In `inventory-intelligence`, compare the app-only target with the `demo` and `full` targets: the latter add Lakeflow Declarative Pipelines, jobs, sample data generation, forecasting, and Sync Tables. That target separation is the pattern to reuse when a client wants a demo environment without accidentally deploying production-scale data workloads.

## Walkthrough protocol for every template

Use this exact worksheet. A template is not “learned” until you can answer all ten items without opening the README.

1. **Purpose** — What user workflow does this app make possible?
2. **Runtime** — What process starts, on which port, with which health check?
3. **Request path** — What is one complete browser-to-Databricks request path?
4. **State** — Is state in the browser, a Volume, Delta, Lakebase, MLflow, or an external service?
5. **Identity** — Which calls use the app service principal, a user token, or a downstream credential?
6. **Resources** — Which `databricks.yml` resources and privileges are required?
7. **Local loop** — Which tests/build/dev command gives fast feedback without a deploy?
8. **Deployment loop** — Which bundle target, app deployment, and GUI checks prove integration?
9. **Failure lab** — Which one missing grant, variable, endpoint, or schema change will you deliberately introduce and diagnose?
10. **Production decision** — What would change for scale, HA, network isolation, observability, cost, and rollback?

The deliverable for each template should be one diagram, one request trace, one permission matrix, one failure transcript, and five recall cards. This converts source browsing into retrieval practice.

## Portfolio mapping

### NFL Media Intelligence Workbench

**Starting point:** `appkit-all-in-one`, with `appkit-files` and `e2e-chatbot-app-next` as focused reference implementations.

**Why:** the workbench needs a React application shell, Volume-backed PDF/media browsing, Lakebase user/session state, Genie analytics, and an agent/chat surface. `appkit-all-in-one` demonstrates the shell and resource wiring; `e2e-chatbot-app-next` demonstrates a modern chat frontend calling a deployed agent. Add AI Search as a separate governed retrieval layer rather than pretending the `rag-chat` Lakebase pgvector implementation is the same product.

**First vertical slice:** upload or select a public NFL PDF in a Volume, show its metadata, ask a citation-bearing question, persist the conversation in Lakebase, and render a small Genie/SQL analytics page. The first version should use public data only and keep the model/retrieval interface behind a server route so the retrieval backend can be swapped.

### Public-document Evidence Assistant

**Starting point:** `appkit-files` + `e2e-chatbot-app-next` + either `agent-langgraph` or `agent-openai-agents-sdk`.

**Why:** this isolates the common PDF workflow: Volume landing, extraction/chunking, governed index, citations, evaluation, and a chat UI. Use `rag-chat` as the Lakebase pgvector comparison implementation, then implement the production-shaped AI Search path separately. The point is to make the backend choice measurable rather than ideological.

**First vertical slice:** a small public corpus, deterministic chunk/metadata schema, 20-question golden set, citation display, and an evaluation table containing retrieval hit rate, answer faithfulness, latency, and cost.

### NFL Era and Defense-Adjusted QB Lab

**Starting point:** `appkit-analytics` + `appkit-genie`, or `appkit-all-in-one` once the analytics slice is stable.

**Why:** this is primarily a governed analytical application. Use SQL warehouse queries and Genie for exploration; add model serving only if a forecast or ranking model needs a runtime endpoint. Keep the UI focused on era normalization, defensive strength, expected wins, and uncertainty rather than turning the first version into an agent.

**First vertical slice:** a curated Delta table of public scraped statistics, three parameterized comparison views, one Genie question path, and an explanation panel that shows the exact source rows behind every claim.

## The build sequence for the next sessions

1. **Files lab:** deploy `appkit-files`; inspect `appkit.plugins.json`, `server/`, `client/`, and the Volume resource. Break `WRITE_VOLUME`, diagnose the error, restore it.
2. **Analytics lab:** add `appkit-analytics`; trace a SQL query and compare warehouse-backed analytics with a Lakebase read.
3. **State lab:** add `appkit-lakebase`; create one user/session table and decide which data must not live in the browser.
4. **Genie and serving lab:** wire both integrations and write the user-token versus app-identity matrix.
5. **Composition lab:** deploy `appkit-all-in-one` and remove one plugin without leaving stale routes or grants.
6. **Agent lab:** deploy `e2e-chatbot-app-next`, then compare `agent-langgraph` and `agent-openai-agents-sdk` at the protocol and authorization boundaries.
7. **Retrieval lab:** implement the same golden set with `rag-chat` and AI Search; benchmark before choosing.
8. **Sustainability lab:** use `inventory-intelligence` to study target separation, jobs, pipelines, Sync Tables, observability, and rollback.

For a two-session day, use the first session for source/code tracing and the second for a modification, deploy, GUI inspection, and recall exercise. Every fourth day, explain one architecture from memory and defend one alternative.

## Commands to use from VS Code

```bash
cd /Users/devos/github/app-templates/appkit-all-in-one
npx @databricks/appkit docs
npm install
npm run dev
npm run build
```

To scaffold a clean copy from the catalog:

```bash
databricks apps init --name nfl-media-workbench \
  --template https://github.com/databricks/app-templates/tree/main/appkit-all-in-one
```

For a bundle-backed template:

```bash
databricks bundle validate -t dev
databricks bundle plan -t dev
databricks bundle deploy -t dev
databricks bundle run -t dev <job-key>
```

For Python Apps, `databricks apps run-local --prepare-environment --debug` is useful for the Databricks App proxy/debug loop. Node/AppKit templates normally use their package scripts for the inner loop. Neither local loop proves deployed service-principal permissions, user scopes, workspace policy, or production networking; those require a dev deployment.

## Verified documentation starting points

- [Databricks Apps overview](https://docs.databricks.com/aws/en/dev-tools/databricks-apps)
- [Develop and deploy Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/deploy)
- [CI/CD on Databricks](https://docs.databricks.com/aws/en/dev-tools/ci-cd)
- [Databricks Connect App tutorial](https://docs.databricks.com/aws/en/dev-tools/databricks-connect/python/tutorial-apps)
- [Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)
- [Bundle tutorials, including Apps](https://docs.databricks.com/aws/en/dev-tools/bundles/tutorials)
- [Databricks AI Search](https://docs.databricks.com/aws/en/ai-search/ai-search)
- [Databricks AppKit documentation](https://databricks.github.io/appkit/)

The links above were checked against the current documentation navigation on August 19, 2026. For API details, prefer the version installed in the template (`npx @databricks/appkit docs`) and the README/code at the pinned repository commit.

## Mastery test

You are ready to move on when you can draw the NFL workbench architecture and answer, without notes:

- Which resource grants are needed for Volume, SQL warehouse, Genie, Lakebase, and model serving?
- Which request executes as the app service principal and which can be user-authorized?
- What changes between local `npm run dev`, `databricks apps run-local`, and a deployed App?
- Why might Lakebase pgvector be the right prototype but AI Search the better governed production choice—or vice versa?
- How would a Bundle promote the app without accidentally promoting demo data jobs or changing shared platform ownership?

