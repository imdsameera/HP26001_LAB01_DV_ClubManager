import "server-only";

import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing environment variable: MONGODB_URI");
}

type MongoGlobal = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const mongoGlobal = globalThis as MongoGlobal;

const clientPromise =
  mongoGlobal._mongoClientPromise ??
  new MongoClient(uri, {
    appName: "club-management-dev",
  }).connect();

if (process.env.NODE_ENV !== "production") {
  mongoGlobal._mongoClientPromise = clientPromise;
}

export async function connectToDatabase(): Promise<MongoClient> {
  return clientPromise;
}

export async function getDb(dbName?: string): Promise<Db> {
  const client = await connectToDatabase();
  return client.db(dbName);
}
