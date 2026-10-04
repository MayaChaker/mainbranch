import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to your .env.local.");
}
const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

export const mongoClient = globalForMongo.mongoClient ?? new MongoClient(uri);
globalForMongo.mongoClient = mongoClient;
