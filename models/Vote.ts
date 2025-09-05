import { Schema, model, models } from "mongoose";

const VoteSchema = new Schema(
  {
  userId: { type: String, required: true, index: true },
    reviewId: { type: Schema.Types.ObjectId, ref: "Review", required: true, index: true },
    type: { type: String, enum: ["up", "down"], required: true },
  },
  { timestamps: true }
);

// 🔑 Evita que un mismo usuario vote dos veces la misma reseña
VoteSchema.index({ userId: 1, reviewId: 1 }, { unique: true });

export default models.Vote || model("Vote", VoteSchema);
