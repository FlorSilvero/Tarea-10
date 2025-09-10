// lib/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

type Cached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// @ts-expect-error
let cached: Cached = global._mongooseCached || { conn: null, promise: null };
// @ts-expect-error
global._mongooseCached = cached;

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    // <- AHORA el error se lanza acá (en tiempo de ejecución),
    //    no al importar el archivo.
    throw new Error('MONGODB_URI no configurada');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
