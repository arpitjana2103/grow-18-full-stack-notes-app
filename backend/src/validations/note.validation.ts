import { z } from "zod";

export const createNoteSchema = z.object({
    title: z.string().trim().min(3).max(50),
    description: z.string().trim().min(0).max(100),
    thumbnail: z.string(),
});

export const updateNoteSchema = z.object({
    title: z.string().trim().min(3).max(50).optional(),
    description: z.string().trim().min(0).max(100).optional(),
    thumbnail: z.string().optional(),
});
