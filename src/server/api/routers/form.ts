
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import fs from "fs";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { updateInputDtoSchema, updateMultipleInputsDtoSchema } from "~/server/models/form/FormDTO";
import type { FormDto, InputDto } from "~/server/models/form/FormDTO";
import { z } from "zod";
import type { Form, Input } from "@prisma/client";

const transformInput = (input: any): InputDto => ({
    id: input.id,
    name: input.name,
    description: input.description,
    type: input.type,
    value: input.value,
    pdfElementId: input.pdfElementId,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt
});

const transformForm = (form: any): FormDto => ({
    id: form.id,
    name: form.name,
    cloudName: form.cloudName,
    fileName: form.fileName,
    fileType: form.fileType,
    fileSize: form.fileSize,
    inputs: form.inputs.map(transformInput),
    projectId: form.projectId,
    project: {
        id: form.project.id,
        name: form.project.name
    },
    createdAt: form.createdAt,
    updatedAt: form.updatedAt
});

export const formRouter = createTRPCRouter({
    get: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }): Promise<FormDto> => {
            const form = await ctx.db.form.findUnique({
                where: { id: input.id },
                include: {
                    inputs: true,
                    project: true
                }
            });

            if (!form) {
                throw new Error("Form not found");
            }

            const returnValue = transformForm(form);
            fs.writeFileSync("form.json", JSON.stringify(returnValue, null, 2));
            // returnValue.inputs = [
            //     {
            //         createdAt: new Date(),
            //         description: "test",
            //         id: 1,
            //         name: "test",
            //         pdfElementId: "topmostSubform[0].Page1[0].FilingStatus[0].f1_01[0]",
            //         type: "INPUT",
            //         value: "test",
            //         updatedAt: new Date()
            //     }
            // ]
            return returnValue;
        }),

    updateInput: publicProcedure
        .input(updateInputDtoSchema)
        .mutation(async ({ ctx, input }): Promise<InputDto> => {
            const updatedInput = await ctx.db.input.update({
                where: { id: input.inputId },
                data: { value: input.value as any }
            });

            return transformInput(updatedInput);
        }),

    updateMultipleInputs: publicProcedure
        .input(updateMultipleInputsDtoSchema)
        .mutation(async ({ ctx, input }): Promise<InputDto[]> => {
            const updates = await Promise.all(
                input.inputs.map(inputData =>
                    ctx.db.input.update({
                        where: { id: inputData.id },
                        data: { value: inputData.value as any }
                    })
                )
            );

            return updates.map(transformInput);
        })
}); 