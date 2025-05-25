import { extractText, getDocumentProxy } from "unpdf";

export async function extractTextFromPdfBuffer(
  pdfBuffer: ArrayBuffer,
): Promise<string> {
  try {
    // Load the PDF document
    // Then, load the PDF file into a PDF.js document
    const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer));

    // Finally, extract the text from the PDF file
    const { text } = await extractText(pdf, { mergePages: true });

    return text;
  } catch (error: unknown) {
    console.error("Error extracting text from PDF:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error("An unknown error occurred while extracting text from PDF");
  }
}
