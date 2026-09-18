import mongoose from 'mongoose';

let isConnected = false;
let connectionAttempted = false;

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('[MongoDB] MONGODB_URI not configured. Operating with persistent disk document store (.data/healthpilot_db.json).');
    return false;
  }

  if (isConnected) return true;

  try {
    connectionAttempted = true;
    const sanitized = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`[MongoDB] Connecting to MongoDB instance at ${sanitized}...`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });

    isConnected = true;
    console.log('[MongoDB] Successfully established Mongoose connection to MongoDB.');
    return true;
  } catch (err: any) {
    console.warn(`[MongoDB] Could not connect to MongoDB (${err?.message || err}). Falling back to local persistent store.`);
    isConnected = false;
    return false;
  }
}

export function isMongoDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
