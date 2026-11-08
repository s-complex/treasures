import { z } from "zod";

export const friendSchema = z
  .object({
    slogan: z.string().min(1),
    avatar: z.string().min(1),
    link: z
      .url()
      .refine((value) => value.startsWith("https://"), {
        message: "Link must use HTTPS",
      }),
  })
  .strict();

export const friendsSchema = z.record(z.string().min(1), friendSchema);
