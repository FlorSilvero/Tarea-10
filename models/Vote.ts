import { Schema, Types, model, models } from 'mongoose';


export interface IVote {
_id: Types.ObjectId;
reviewId: Types.ObjectId; // ref Review
userId: Types.ObjectId; // ref User
type: 1 | -1; // like = 1, dislike = -1
createdAt: Date;
updatedAt: Date;
}


const VoteSchema = new Schema<IVote>({
reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true, index: true },
userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
type: { type: Number, enum: [1, -1], required: true },
}, { timestamps: true });


VoteSchema.index({ reviewId: 1, userId: 1 }, { unique: true });


export default models.Vote || model<IVote>('Vote', VoteSchema);