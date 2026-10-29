import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 2000,
  connectTimeoutMS: 2000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientInstance: MongoClient | null | undefined;
  // eslint-disable-next-line no-var
  var _mongoLastFailure: number | undefined;
}

let client: MongoClient | null = null;
const CIRCUIT_BREAKER_COOLDOWN_MS = 20000; // 20s cooldown on failure

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) {
    return null;
  }

  // Circuit breaker: If connection failed recently (e.g. port 27017 blocked or IP not whitelisted),
  // don't stall incoming requests with 5-second connection timeouts.
  const lastFailure = global._mongoLastFailure || 0;
  if (Date.now() - lastFailure < CIRCUIT_BREAKER_COOLDOWN_MS) {
    return null;
  }

  if (process.env.NODE_ENV === "development" && global._mongoClientInstance) {
    return global._mongoClientInstance;
  }

  if (client) {
    return client;
  }

  try {
    const newClient = new MongoClient(uri, options);
    await newClient.connect();

    if (process.env.NODE_ENV === "development") {
      global._mongoClientInstance = newClient;
    }
    client = newClient;
    global._mongoLastFailure = 0;
    return newClient;
  } catch (err) {
    global._mongoLastFailure = Date.now();
    // Graceful catch - never cause an unhandledRejection
    return null;
  }
}

export async function getMongoDb(dbName = process.env.MONGODB_DB || "cognita_study"): Promise<Db | null> {
  try {
    const c = await getMongoClient();
    if (!c) {
      return null;
    }
    return c.db(dbName);
  } catch {
    return null;
  }
}

export default getMongoClient;
