// api/src/functions/submissions.js
//
// Azure Functions v4 model — the direct equivalent of api/submissions.js
// in the Vercel version, using Azure Table Storage instead of Vercel KV.
//
// POST -> save one guest submission (no auth needed — guests use this)
// GET  -> list all submissions (requires ?code=... matching TEAM_ACCESS_CODE,
//         checked server-side here, never shipped to the browser)

const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");

const TABLE_NAME = "submissions";
const PARTITION_KEY = "submission";

async function getTableClient() {
  const client = TableClient.fromConnectionString(
    process.env.AZURE_TABLES_CONNECTION_STRING,
    TABLE_NAME
  );
  // Safe to call every time — no-ops if the table already exists.
  await client.createTable().catch(() => {});
  return client;
}

app.http("submissions", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "submissions",
  handler: async (request, context) => {
    const client = await getTableClient();

    if (request.method === "POST") {
      const entry = await request.json();
      if (!entry || !entry.id) {
        return { status: 400, jsonBody: { error: "Missing entry id" } };
      }
      await client.upsertEntity({
        partitionKey: PARTITION_KEY,
        rowKey: entry.id,
        data: JSON.stringify(entry)
      });
      return { status: 200, jsonBody: { ok: true } };
    }

    if (request.method === "GET") {
      const code = request.query.get("code");
      if (!code || code !== process.env.TEAM_ACCESS_CODE) {
        return { status: 401, jsonBody: { error: "Incorrect access code" } };
      }
      const entries = [];
      const iterator = client.listEntities({
        queryOptions: { filter: `PartitionKey eq '${PARTITION_KEY}'` }
      });
      for await (const entity of iterator) {
        entries.push(JSON.parse(entity.data));
      }
      entries.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
      return { status: 200, jsonBody: { entries } };
    }

    return { status: 405, jsonBody: { error: "Method not allowed" } };
  }
});
