// src/utils/skillSchema.ts
import { z } from "zod";

export const skillFormSchema = z.object({
  name: z.string().min(1, "Tên kỹ năng không được để trống"),
  level: z.number().min(1).max(5),
  years: z.number().min(0).max(50),
  note: z.string().optional(),
});

export type SkillFormValues = z.infer<typeof skillFormSchema>;
