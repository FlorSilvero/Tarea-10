// src/lib/db.ts
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("Missing MONGODB_URI env var");

let cached = (global as any).mongoose as
  | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
  | undefined;

export async function connectToDB() {
  if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
    })
      .then((conn) => {
        console.log('Conexión a MongoDB exitosa');
        return conn;
      })
      .catch((err) => {
        console.error('Error de conexión a MongoDB:', err);
        throw err;
      });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    // El error ya fue logueado arriba
    throw err;
  }
}
