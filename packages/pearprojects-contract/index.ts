import * as z from "zod";

export const Message = z.object({
  type: z.enum(["create-project", "message", "get-all-projects"]),
});

export const CreateProject = z.object({
  type: z.literal("create-project"),
  key: z.string(),
  name: z.string(),
  description: z.string(),
});

export const GetAllProjects = z.object({
  type: z.literal("get-all-projects"),
});

export type CreateProject = z.infer<typeof CreateProject>;
export type GetAllProjects = z.infer<typeof GetAllProjects>;
