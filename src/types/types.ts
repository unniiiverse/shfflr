import z from 'zod';



export const configScheme = z.object({
  dist_dir: z.string(),
  source_dir: z.string(),
});

export type IConfig = z.infer<typeof configScheme>