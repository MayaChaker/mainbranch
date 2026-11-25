import { MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

export function getMongoClient(): MongoClient {
  if (globalForMongo.mongoClient) return globalForMongo.mongoClient;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to your .env.local.");
  }

  globalForMongo.mongoClient = new MongoClient(uri);
  return globalForMongo.mongoClient;
}
