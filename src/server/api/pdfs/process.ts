import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { extractTextFromPdfBuffer } from "./parsing";
import { z } from "zod";
import { env } from "~/env";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://vibedoc.com", // Required for OpenRouter
    "X-Title": "VibeDoc", // Optional, shows in rankings
  },
});

interface PdfCoResponse {
  status: string;
  message: string;
  url: string;
  body: {
    PageCount: number;
    Author: string;
    Title: string;
    Producer: string;
    Subject: string;
    CreationDate: string;
    Bookmarks: string;
    Keywords: string;
    Creator: string;
    Encrypted: boolean;
    PasswordProtected: boolean;
    PageRectangle: {
      Location: {
        IsEmpty: boolean;
        X: number;
        Y: number;
      };
      Size: string;
      X: number;
      Y: number;
      Width: number;
      Height: number;
      Left: number;
      Top: number;
      Right: number;
      Bottom: number;
      IsEmpty: boolean;
    };
    ModificationDate: string;
    AttachmentCount: number;
    EncryptionAlgorithm: string;
    PermissionPrinting: boolean;
    PermissionModifyDocument: boolean;
    PermissionContentExtraction: boolean;
    PermissionModifyAnnotations: boolean;
    PermissionFillForms: boolean;
    PermissionAccessibility: boolean;
    PermissionAssemble: boolean;
    PermissionHighQualityPrint: boolean;
    CustomProperties: unknown[];
    FieldsInfo: {
      Fields: Array<{
        PageIndex: number;
        Type: string;
        FieldName: string;
        AltFieldName: string;
        Value: string;
        Left: number;
        Top: number;
        Width: number;
        Height: number;
      }>;
    };
  };
  jobId: string;
  credits: number;
  remainingCredits: number;
  jobDuration: number;
  duration: number;
}

export const pdfRouter = createTRPCRouter({
  extractText: publicProcedure
    .input(z.object({ fileUrl: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { fileUrl } = input;

        // Fetch the file from the URL
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        // Get the PDF as an ArrayBuffer
        const pdfBuffer = await response.arrayBuffer();

        // Extract text from the PDF
        const text = await extractTextFromPdfBuffer(pdfBuffer);

        return { text };
      } catch (error) {
        console.error('Error processing PDF:', error);
        throw error;
      }
    }),

  extractRawFields: publicProcedure
    .input(z.object({ fileUrl: z.string() }))
    .mutation(async ({ input }): Promise<PdfCoResponse> => {
      try {
        const { fileUrl } = input;

        const data = {
          url: fileUrl,
          async: false,
        };

        const response = await fetch('https://api.pdf.co/v1/pdf/info/fields', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': env.PDF_CO_TOKEN
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`PDF.co API error: ${response.statusText}`);
        }

        const result = await response.json() as PdfCoResponse;
        return result;
      } catch (error) {
        console.error('Error processing PDF with PDF.co:', error);
        throw error;
      }
    }),

  getContextualizedFields: publicProcedure
    .input(z.object({
      text: z.string(),
      fields: z.any(), // TODO: add a schema for the fields - they are currently the raw fields from the pdf.co api
      prompt: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const { text, fields, prompt } = input;

        // TODO: add unique field ids to each field and strip some of the unneeded keys from the fields object like "Left", "Top", "Width", "Height". 

        const completion = await openai.chat.completions.create({
          model: "google/gemini-2.5-flash-preview",
          messages: [
            {
              role: "system",
              content: prompt
            },
            {
              role: "user",
              content: JSON.stringify({
                text,
                fields
              })
            }
          ],
          temperature: 0.7,
          max_tokens: 40000,
          response_format: { type: "json_object" }
        });
        // TODO: process the response and add the stripped keys back to the fields object
        return {
          response: completion.choices[0]?.message?.content
        };
      } catch (error) {
        console.error('Error getting contextualized fields:', error);
        throw error;
      }
    }),
}); 
