/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    createProjectDtoSchema,
    updateProjectNameDtoSchema,
    updateSystemPromptDtoSchema,
    uploadDocumentDtoSchema,
    createFormDtoSchema,
} from "~/server/models/project/ProjectDTO";
import fs from "fs"
import { type ProjectDto, type ProjectDocumentDto, type ProjectListItemDto } from "~/server/models/project/ProjectResponse";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import type { AdditionalDocument, Form } from "@prisma/client";
import { env } from "~/env";
import { OpenAI } from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://vibedoc.com",
        "X-Title": "VibeDoc",
    },
});

interface PdfCoField {
    PageIndex: number;
    Type: string;
    FieldName: string;
    AltFieldName: string;
    Left: number;
    Top: number;
    Width: number;
    Height: number;
}

interface PdfCoFieldsInfo {
    Fields: PdfCoField[];
}

interface PdfCoResponse {
    info: {
        FieldsInfo: PdfCoFieldsInfo;
    };
}

interface PdfCoTextResponse {
    text: string;
    url?: string;
}

async function getDocumentText(cloudName: string): Promise<string> {
    const fileUrl = `https://uploadthing.com/f/${cloudName}`;
    const textResponse = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': env.PDF_CO_TOKEN ?? ''
        },
        body: JSON.stringify({
            url: fileUrl,
            async: false
        })
    });

    if (!textResponse.ok) {
        throw new Error(`PDF.co text extraction API error: ${textResponse.statusText}`);
    }

    const textResult = (await textResponse.json()) as PdfCoTextResponse;
    return textResult.text;
}

export const projectRouter = createTRPCRouter({
    get: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }): Promise<ProjectDto> => {
            const project = await ctx.db.project.findUnique({
                where: { id: input.id },
                include: {
                    additionalDocuments: true,
                    forms: {
                        include: {
                            inputs: true
                        }
                    }
                }
            });

            if (!project) {
                throw new Error("Project not found");
            }

            return {
                id: project.id,
                name: project.name,
                systemPrompt: project.systemPrompt,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                forms: project.forms,
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
                    additionalDocuments: true,
                    forms: {
                        include: {
                            inputs: true
                        }
                    }
                }
            });

            return {
                id: project.id,
                name: project.name,
                systemPrompt: project.systemPrompt,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                forms: project.forms,
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
                    additionalDocuments: true,
                    forms: {
                        include: {
                            inputs: true
                        }
                    }
                }
            });

            return {
                id: project.id,
                name: project.name,
                systemPrompt: project.systemPrompt,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                forms: project.forms,
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
                    additionalDocuments: true,
                    forms: {
                        include: {
                            inputs: true
                        }
                    }
                }
            });

            return {
                id: project.id,
                name: project.name,
                systemPrompt: project.systemPrompt,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                forms: project.forms,
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
                    cloudName: input.cloudName,
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

    deleteDocument: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.additionalDocument.delete({
                where: { id: input.id },
            });
            return { success: true };
        }),

    createForm: publicProcedure
        .input(createFormDtoSchema)
        .mutation(async ({ ctx, input }): Promise<Form> => {
            // Create the form first
            const form = await ctx.db.form.create({
                data: {
                    projectId: input.projectId,
                    name: input.name,
                    fileName: input.fileName,
                    fileType: input.fileType,
                    fileSize: input.fileSize,
                    cloudName: input.cloudName,
                },
            });

            try {
                // Get the file URL from Uploadthing
                const fileUrl = `https://uploadthing.com/f/${input.cloudName}`;

                const project = await ctx.db.project.findUnique({
                    where: { id: input.projectId },
                    include: {
                        additionalDocuments: true
                    }
                });

                if (!project) {
                    throw new Error("Project not found");
                }

                // Get text content from all additional documents
                const additionalDocTexts = await Promise.all(
                    project.additionalDocuments.map(doc => getDocumentText(doc.cloudName))
                );

                // First get the PDF text content of the form itself
                const formText = await getDocumentText(input.cloudName);

                // Then get the field information
                const response = await fetch('https://api.pdf.co/v1/pdf/info/fields', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-api-key': env.PDF_CO_TOKEN ?? ''
                    },
                    body: JSON.stringify({
                        url: fileUrl,
                        async: false
                    })
                });

                if (!response.ok) {
                    throw new Error(`PDF.co API error: ${response.statusText}`);
                }

                const result = (await response.json()) as PdfCoResponse;

                fs.writeFileSync("result.json", JSON.stringify(result, null, 2));

                const fields = result.info.FieldsInfo.Fields;
                console.log(`Get field descriptions...`)
                // Get field descriptions from OpenAI
                const completion = await openai.chat.completions.create({
                    model: "google/gemini-2.5-flash-preview",
                    messages: [
                        {
                            role: "system",
                            content: `You are an expert at analyzing PDF forms and creating clear, concise descriptions for form fields. Given the content of a PDF and information about form fields, you will create helpful descriptions that explain what each field is for and also a short name, which can be displayed on a form.
                            
                            The output should be a JSON object, of this schema:
                            {
                             "name": "string",
                             "description": "string",
                             "shortName": "string"
                            }[]
                            `
                        },
                        {
                            role: "user",
                            content: JSON.stringify({
                                pdfText: formText,
                                fields: fields.map(f => ({
                                    name: f.AltFieldName || f.FieldName,
                                    type: f.Type,
                                    location: { page: f.PageIndex + 1, top: f.Top, left: f.Left }
                                }))
                            })
                        }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                });

                const fieldDescriptions = JSON.parse(completion.choices[0]?.message?.content ?? "{}") as { name: string, description: string, shortName: string }[];

                fs.writeFileSync("field_descriptions.json", JSON.stringify(fieldDescriptions, null, 2));

                // Get suggested values based on project context
                const valueCompletion = await openai.chat.completions.create({
                    model: "google/gemini-2.5-flash-preview",
                    messages: [
                        {
                            role: "system",
                            content: `You are an AI assistant specialized in filling out forms based on available context. 
                            
                            You have access to:
                            1. The system prompt that defines the purpose of this project
                            2. Additional documents that provide context
                            3. The form itself and its fields
                            
                            Based on this information, suggest appropriate values for each form field.
                            Your output should be a JSON object where:
                            - Keys are the field names
                            - Values are your suggested values, appropriate for the field type (boolean for checkboxes, string for text/select)
                            
                            Only suggest values if you are reasonably confident based on the available context.
                            If you cannot determine a good value for a field, set it to null.`
                        },
                        {
                            role: "user",
                            content: JSON.stringify({
                                systemPrompt: project.systemPrompt,
                                additionalDocuments: additionalDocTexts,
                                formContent: formText,
                                fields: fields.map(f => ({
                                    name: f.AltFieldName || f.FieldName,
                                    type: f.Type,
                                    description: fieldDescriptions.find(d => d.name === f.AltFieldName || d.name === f.FieldName)?.description
                                }))
                            })
                        }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                });

                const suggestedValues = JSON.parse(valueCompletion.choices[0]?.message?.content ?? "{}") as Record<string, unknown>;

                fs.writeFileSync("value_completion.json", JSON.stringify(suggestedValues, null, 2));
                console.log(`Got suggested values`)

                fs.writeFileSync("fields.json", JSON.stringify(fields, null, 2));

                // Create inputs for each field
                await Promise.all(fields.map((field) => {
                    // Determine input type based on field properties
                    let inputType: "INPUT" | "CHECKBOX" | "SELECT" = "INPUT";
                    if (field.Type.toLowerCase().includes("checkbox")) {
                        inputType = "CHECKBOX";
                    } else if (field.Type.toLowerCase().includes("select") || field.Type.toLowerCase().includes("combo")) {
                        inputType = "SELECT";
                    }

                    const fieldName = fieldDescriptions.find(d => d.name === field.AltFieldName || d.name === field.FieldName)?.shortName ??
                        field.AltFieldName ?? field.FieldName;
                    const description = fieldDescriptions.find(d => d.name === fieldName)?.description ??
                        `Field of type ${field.Type} from page ${field.PageIndex + 1}`;

                    // Get the suggested value for this field
                    const suggestedValue = suggestedValues[field.FieldName];
                    console.log(`Suggested value for ${fieldName}: ${suggestedValue as any}`);
                    const value = inputType === "CHECKBOX"
                        ? Boolean(suggestedValue)
                        : (suggestedValue?.toString() ?? "");

                    return ctx.db.input.create({
                        data: {
                            formId: form.id,
                            name: fieldName,
                            description,
                            type: inputType,
                            value,
                            pdfElementId: field.FieldName
                        }
                    });
                }));
            } catch (error) {
                console.error(error);
                // We don't throw here because we still want to return the form
                // even if field analysis fails

                throw error;
            }

            return form;
        }),
}); 