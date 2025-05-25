import { z } from "zod";
import type { InputType } from "@prisma/client";

// Input DTOs
export interface InputDto {
    id: number;
    name: string;
    description: string;
    type: InputType;
    value: unknown;
    pdfElementId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FormDto {
    id: number;
    name: string;
    cloudName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    inputs: InputDto[];
    projectId: number;
    project: {
        id: number;
        name: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Update Input DTOs
export const updateInputDtoSchema = z.object({
    inputId: z.number(),
    value: z.unknown()
});
export type UpdateInputDto = z.infer<typeof updateInputDtoSchema>;

export const updateMultipleInputsDtoSchema = z.object({
    inputs: z.array(z.object({
        id: z.number(),
        value: z.unknown()
    }))
});
export type UpdateMultipleInputsDto = z.infer<typeof updateMultipleInputsDtoSchema>; 