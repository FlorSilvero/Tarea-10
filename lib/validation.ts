import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const reviewSchema = z.object({
  volumeId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(5),
});

export const voteSchema = z.object({
  reviewId: z.string().min(1),
  delta: z.number().int().refine((v) => v === 1 || v === -1),
});

export const favoriteSchema = z.object({
  volumeId: z.string().min(1),
});
