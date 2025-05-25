import {
    createProjectDtoSchema,
    updateProjectNameDtoSchema,
    updateSystemPromptDtoSchema,
    uploadDocumentDtoSchema,
} from "~/server/models/project/ProjectDTO";
import { type ProjectDto, type ProjectDocumentDto, type ProjectListItemDto } from "~/server/models/project/ProjectResponse";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import type { AdditionalDocument } from "@prisma/client";

export const projectRouter = createTRPCRouter({
    get: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }): Promise<ProjectDto> => {
            const project = await ctx.db.project.findUnique({
                where: { id: input.id },
                include: {
                    additionalDocuments: true
                }
            });

            if (!project) {
                throw new Error("Project not found");
            }

            return {
                ...project,
                additionalDocuments: project.additionalDocuments.map((doc: AdditionalDocument): ProjectDocumentDto => ({
                    id: doc.id,
                    fileName: doc.fileName,
                    fileType: doc.fileType,
                    fileSize: doc.fileSize,
                    cloudName: doc.cloudName,
                    createdAt: doc.createdAt
                }))
            };
        }),

    list: publicProcedure.query(async ({ ctx }): Promise<ProjectListItemDto[]> => {
        const projects = await ctx.db.project.findMany({
            include: {
                _count: {
                    select: { additionalDocuments: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return projects.map(project => ({
            id: project.id,
            name: project.name,
            systemPrompt: project.systemPrompt,
            documentCount: project._count.additionalDocuments,
            createdAt: project.createdAt
        }));
    }),

    create: publicProcedure
        .input(createProjectDtoSchema)
        .mutation(async ({ ctx, input }): Promise<ProjectDto> => {
            const project = await ctx.db.project.create({
                data: {
                    name: input.name,
                    systemPrompt: "",
                },
                include: {
                    additionalDocuments: true
                }
            });

            return {
                ...project,
                additionalDocuments: project.additionalDocuments.map(doc => ({
                    id: doc.id,
                    fileName: doc.fileName,
                    fileType: doc.fileType,
                    fileSize: doc.fileSize,
                    cloudName: doc.cloudName,
                    createdAt: doc.createdAt
                }))
            };
        }),

    updateSystemPrompt: publicProcedure
        .input(updateSystemPromptDtoSchema)
        .mutation(async ({ ctx, input }): Promise<ProjectDto> => {
            const project = await ctx.db.project.update({
                where: { id: input.id },
                data: { systemPrompt: input.systemPrompt },
                include: {
                    additionalDocuments: true
                }
            });

            return {
                ...project,
                additionalDocuments: project.additionalDocuments.map(doc => ({
                    id: doc.id,
                    fileName: doc.fileName,
                    fileType: doc.fileType,
                    fileSize: doc.fileSize,
                    cloudName: doc.cloudName,
                    createdAt: doc.createdAt
                }))
            };
        }),

    updateName: publicProcedure
        .input(updateProjectNameDtoSchema)
        .mutation(async ({ ctx, input }): Promise<ProjectDto> => {
            const project = await ctx.db.project.update({
                where: { id: input.id },
                data: { name: input.name },
                include: {
                    additionalDocuments: true
                }
            });

            return {
                ...project,
                additionalDocuments: project.additionalDocuments.map(doc => ({
                    id: doc.id,
                    fileName: doc.fileName,
                    fileType: doc.fileType,
                    fileSize: doc.fileSize,
                    cloudName: doc.cloudName,
                    createdAt: doc.createdAt
                }))
            };
        }),

    delete: publicProcedure
        .input(updateProjectNameDtoSchema.pick({ id: true }))
        .mutation(async ({ ctx, input }): Promise<void> => {
            await ctx.db.project.delete({
                where: { id: input.id },
            });
        }),

    uploadDocument: publicProcedure
        .input(uploadDocumentDtoSchema)
        .mutation(async ({ ctx, input }): Promise<ProjectDocumentDto> => {
            const document = await ctx.db.additionalDocument.create({
                data: {
                    projectId: input.projectId,
                    fileName: input.fileName,
                    fileType: input.fileType,
                    fileSize: input.fileSize,
                    cloudName: `dummy-cloud-name-${Date.now()}`,
                },
            });

            return {
                id: document.id,
                fileName: document.fileName,
                fileType: document.fileType,
                fileSize: document.fileSize,
                cloudName: document.cloudName,
                createdAt: document.createdAt
            };
        }),
}); 