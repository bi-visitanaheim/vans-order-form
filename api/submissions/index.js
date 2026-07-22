const { TableClient } = require("@azure/data-tables");

const TABLE_NAME = "submissions";
const PARTITION_KEY = "submission";

async function getTableClient() {
  const client = TableClient.fromConnectionString(
    process.env.AZURE_TABLES_CONNECTION_STRING,
    TABLE_NAME
  );
  await client.createTable().catch(() => {}); // no-op if it already exists
  return client;
}

module.exports = async function (context, req) {
  const client = await getTableClient();

  if (req.method === "POST") {
    const entry = req.body;
    if (!entry || !entry.id) {
      context.res = { status: 400, jsonBody: { error: "Missing entry id" } };
      return;
    }
    await client.upsertEntity({
      partitionKey: PARTITION_KEY,
      rowKey: entry.id,
      data: JSON.stringify(entry)
    });
    context.res = { status: 200, jsonBody: { ok: true } };
    return;
  }

  if (req.method === "GET") {
    const code = req.query.code;
    if (!code || code !== process.env.TEAM_ACCESS_CODE) {
      context.res = { status: 401, jsonBody: { error: "Incorrect access code" } };
      return;
    }
    const entries = [];
    const iterator = client.listEntities({
      queryOptions: { filter: `PartitionKey eq '${PARTITION_KEY}'` }
    });
    for await (const entity of iterator) {
      entries.push(JSON.parse(entity.data));
    }
    entries.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    context.res = { status: 200, jsonBody: { entries } };
    return;
  }

  context.res = { status: 405, jsonBody: { error: "Method not allowed" } };
};
