// src/models/Review.ts
import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
  userId: { type: String, required: true, index: true },
  userName: { type: String },
  userEmail: { type: String },
    volumeId: { type: String, required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    content: { type: String, required: true },
    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 },
    votes: {
      type: [
        {
          userId: { type: String, required: true },
          value: { type: Number, enum: [1, -1], required: true }
        }
      ],
      default: [],
    },
  },
  { timestamps: true }
);
ReviewSchema.index({ userId: 1, volumeId: 1 }, { unique: true });

export default models.Review || model("Review", ReviewSchema);
