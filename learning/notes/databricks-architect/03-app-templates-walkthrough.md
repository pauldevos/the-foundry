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

### 1. Runtime and framework comparisons — compress this to one decision table

Do not spend a study session on six hello-world frameworks. They are scaffolds, not meaningful architecture examples. Read the table once, then use `nodejs-fastapi-hello-world-app` as the only runtime comparison worth reproducing.

| Template | Process entrypoint in `app.yaml` | Port/host behavior in the template | Declared Databricks resources | Architectural verdict |
| --- | --- | --- | --- | --- |
| `streamlit-hello-world-app` | `streamlit run app.py` | No `DATABRICKS_APP_PORT`, host, or port is passed. Streamlit defaults are not a production Apps contract. | None; no `databricks.yml` | Skip as a framework choice. Use only to recognize a legacy/simple Python UI. |
| `dash-hello-world-app` | `python app.py` | `dash_app.run(debug=True)` supplies no explicit Apps port/host. The hello app is using a development server. | None; no `databricks.yml` | Not a pattern for your React/TypeScript applications. |
| `gradio-hello-world-app` | `python app.py` | `gradio_app.launch()` supplies no explicit Apps port/host. | None; no `databricks.yml` | Skip unless a client explicitly wants a model-demo UI. |
| `shiny-hello-world-app` | `shiny run --reload app.py:app` | CLI command supplies no explicit Apps port/host and includes reload behavior. | None; no `databricks.yml` | R is not relevant to your target work; do not study it. |
| `flask-hello-world-app` | `flask --app app.py run` | The `if __name__ == '__main__'` fallback uses `FLASK_RUN_PORT`/8000, but that block is not used by the Flask CLI command. The command does not set `0.0.0.0` or `DATABRICKS_APP_PORT`. | None; no `databricks.yml` | Flask’s dev server is not a production pattern. Use FastAPI/ASGI or a WSGI server only when a legacy dependency forces it. |
| `nodejs-fastapi-hello-world-app` | `uvicorn backend.main:app` | The FastAPI command also does not explicitly pass `--host 0.0.0.0 --port $DATABRICKS_APP_PORT`; the README’s local command uses `0.0.0.0:8000`. Treat this as a scaffold to harden, not a final port example. | None; no `databricks.yml` | The only useful comparison: React/Vite build artifact served by FastAPI, with `/api/*` routes. This is closest to your target app shape. |

**Common identity answer:** all six templates have an app identity when deployed, but none declares a warehouse, Volume, Genie space, serving endpoint, Lakebase database, secret, or other Databricks resource. Therefore the template-specific service-principal grant set is empty. They prove only “a process can start,” not governed data/AI access.

**Important platform rule:** a Databricks App must listen on `0.0.0.0` and the runtime port in `DATABRICKS_APP_PORT`. These hello templates mostly omit that wiring, so do not copy their commands into a serious application without correcting the runtime contract. The current Databricks docs explicitly call out this requirement.

**Bundle answer:** these six are direct app templates: they contain `manifest.yaml`, `app.yaml`, and dependencies, but no `databricks.yml`. They are initialized/deployed as an app and have no bundle-managed supporting resources. By contrast, a Node/Python production project should normally use a Bundle to manage the app plus its resources, permissions, targets, and CI/CD promotion.

**Decision:** for your work, skip Streamlit, Dash, Gradio, Shiny, and Flask as learning tracks. Spend ten minutes on the table above, then move directly to `appkit-files`, `appkit-all-in-one`, `e2e-chatbot-app-next`, and the agent templates. Keep the Node/FastAPI example as a small reference for the “React frontend → Python API → Databricks services” boundary.

### 2. One-resource application patterns

Read `appkit-files`, `appkit-analytics`, `appkit-genie`, `appkit-serving`, and `appkit-lakebase`.

Each template isolates one integration:

- **Files**: Unity Catalog Volume access and file operations.
- **Analytics**: SQL warehouse access and query-driven UI.
- **Genie**: a Genie space plus the `dashboards.genie` user scope.
- **Serving**: model serving endpoint access and the `serving.serving-endpoints` user scope.
- **Lakebase**: managed Postgres connection, schema/data ownership, and connection pooling.

“Trace one button” means trace one **user interaction** through every architectural boundary. It does not mean every template literally exposes a button, and several AppKit UI components hide the HTTP call inside a hook or packaged component.

| Template | Start with this interaction | Client-to-server path | Plugin-to-Databricks path | Deployment contract |
| --- | --- | --- | --- | --- |
| `appkit-files` | Click **Upload** and select a file. | `FilesPage.handleUpload()` sends `POST /api/files/{volumeKey}/upload?path=...`. | The route is registered internally by `files()` in `server/server.ts`; the plugin operates on the Volume named by `DATABRICKS_VOLUME_FILES`. | `app.yaml` maps that environment variable from resource key `files`; `databricks.yml` grants `WRITE_VOLUME` on that UC Volume and declares `files.files` as a user API scope. |
| `appkit-analytics` | Open Analytics or change the month selector. | `useAnalyticsQuery('hello_world', ...)` and chart components using query key `mocked_sales` call AppKit's packaged analytics endpoint. There is no hand-written Express route in the template. | `analytics()` loads the SQL under `config/queries/` and executes it through the configured SQL warehouse. | `DATABRICKS_WAREHOUSE_ID` comes from resource key `sql-warehouse`; the app resource has `CAN_USE`. The OBO `sql` scope is commented out, so this template is shaped around app identity. |
| `appkit-genie` | Enter a question and submit it in `<GenieChat alias="default" />`. | `GenieChat` owns the client request and conversation mechanics; the template does not expose its internal fetch call. | The packaged request reaches `genie()` in `server/server.ts`, which targets `DATABRICKS_GENIE_SPACE_ID`. | Resource key `genie-space` grants `CAN_RUN`; `dashboards.genie` permits the App to request the corresponding user-authorized API scope. These are separate controls. |
| `appkit-serving` | Enter a message and click **Send**. | `handleSubmit()` calls `invoke()` from `useServingInvoke`; the hook calls the packaged serving route. | `serving()` proxies/invokes the endpoint named by `DATABRICKS_SERVING_ENDPOINT_NAME`. | Resource key `serving-endpoint` grants `CAN_QUERY`; `serving.serving-endpoints` is the user API scope. A streaming UI would replace the hook with `useServingStream`. |
| `appkit-lakebase` | Enter a todo and click **Add**. | `addTodo()` sends `POST /api/lakebase/todos`. This route is explicitly implemented in `server/routes/lakebase/todo-routes.ts`. | The route validates the body and calls `appkit.lakebase.query('INSERT ...')`; startup also creates schema `app` and table `app.todos` when needed. | `LAKEBASE_ENDPOINT` comes from resource key `postgres`; `databricks.yml` binds a branch/database with `CAN_CONNECT_AND_CREATE`. No user API scope is enabled in this example. |

The trace is therefore:

```text
user interaction
  → React event handler or AppKit UI hook
  → HTTP request (explicit or hidden inside AppKit UI)
  → Express route (custom or registered by an AppKit plugin)
  → plugin SDK/client call
  → environment value injected from app.yaml
  → resource key and permission declared in databricks.yml
  → Databricks service
```

The original “remove the resource grant” instruction was also imprecise. There are two different failure tests:

1. **Configuration failure:** delete or rename the resource key in `databricks.yml` while `app.yaml` still contains `valueFrom: <key>`. Validation or deployment should reject the unresolved binding. This proves the configuration contract, but teaches little about runtime authorization.
2. **Authorization failure:** keep the resource declaration and environment binding intact, deploy in a disposable development target, then temporarily revoke the App service principal's permission on the underlying resource. Files should fail on the Volume operation, Analytics on warehouse execution, Serving on endpoint invocation, and Lakebase during setup/query. Restore the grant immediately afterward.

For Genie and Serving, test the app resource permission and the user API scope separately: a service-principal grant and permission to request an on-behalf-of-user token are not interchangeable. Do this only when the relevant service is available in a workspace; it is not prerequisite reading for Free Edition.

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
