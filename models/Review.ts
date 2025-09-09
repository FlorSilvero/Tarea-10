import { Schema, Types, model, models } from 'mongoose';


export interface IReview {
_id: Types.ObjectId;
userId: Types.ObjectId; // ref User
volumeId: string; // Google Books volumeId
rating: number; // 1..5
content: string;
upCount: number; // denormalized counters
downCount: number;
createdAt: Date;
updatedAt: Date;
}


const ReviewSchema = new Schema<IReview>({
userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
volumeId: { type: String, required: true, index: true },
rating: { type: Number, min: 1, max: 5, required: true },
content: { type: String, required: true, trim: true },
upCount: { type: Number, default: 0 },
downCount: { type: Number, default: 0 },
}, { timestamps: true });


ReviewSchema.index({ userId: 1, volumeId: 1 }, { unique: true });


export default models.Review || model<IReview>('Review', ReviewSchema);