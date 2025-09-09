import mongoose from 'mongoose';


const MONGODB_URI = process.env.MONGODB_URI!;


if (!MONGODB_URI) {
throw new Error('MONGODB_URI no configurada');
}


let cached = (global as any)._mongoose as { conn: typeof mongoose | null, promise: Promise<typeof mongoose> | null };
if (!cached) cached = (global as any)._mongoose = { conn: null, promise: null };


export async function connectToDB() {
if (cached.conn) return cached.conn;
if (!cached.promise) {
cached.promise = mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined });
}
cached.conn = await cached.promise;
return cached.conn;
}