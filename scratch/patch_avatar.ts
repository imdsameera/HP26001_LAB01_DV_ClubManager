import { MongoClient } from "mongodb";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function patch() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return console.log("No URI");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("club-management-dev");
  const res = await db.collection("members").updateMany(
    { status: "pending" },
    { $set: { avatarUrl: "https://i.pravatar.cc/150?img=11" } }
  );
  console.log("Updated", res.modifiedCount);
  await client.close();
}
patch().catch(console.error);
