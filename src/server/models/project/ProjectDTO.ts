import { z } from "zod";

export const createProjectDtoSchema = z.object({
    name: z.string().min(1, "Project name is required"),
});
export type CreateProjectDto = z.infer<typeof createProjectDtoSchema>;

export const updateProjectNameDtoSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "Project name is required"),
});
export type UpdateProjectNameDto = z.infer<typeof updateProjectNameDtoSchema>;

export const updateSystemPromptDtoSchema = z.object({
    id: z.number(),
    systemPrompt: z.string(),
});
export type UpdateSystemPromptDto = z.infer<typeof updateSystemPromptDtoSchema>;

export const uploadDocumentDtoSchema = z.object({
    projectId: z.number(),
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
});
export type UploadDocumentDto = z.infer<typeof uploadDocumentDtoSchema>; 