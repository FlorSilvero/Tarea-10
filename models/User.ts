import mongoose, { Schema, Types, model, models } from 'mongoose';


export interface IUser {
_id: Types.ObjectId;
email: string;
name?: string;
passwordHash: string;
favorites: string[]; // Google Books volumeId
createdAt: Date;
updatedAt: Date;
}


const UserSchema = new Schema<IUser>({
email: { type: String, unique: true, required: true, index: true },
name: { type: String },
passwordHash: { type: String, required: true },
favorites: { type: [String], default: [] },
}, { timestamps: true });


export default models.User || model<IUser>('User', UserSchema);