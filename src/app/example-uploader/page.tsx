"use client";

import { api } from "~/trpc/react";
import { useState } from "react";

interface PdfCoResponse {
  status: number;
  error: boolean;
  message: string;
  data?: {
    url: string;
    pageCount: number;
    csv: string;
  };
}

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [pdfCoResult, setPdfCoResult] = useState<PdfCoResponse | null>(null);
  const [contextualizedFields, setContextualizedFields] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>(
    "https://azr7gevv5i.ufs.sh/f/ZKKRdIEDazFi2NdlpHO7xytOEol8YjkvbGaZDJPIrAeHnq6g",
  );

  const extractText = api.pdf.extractText.useMutation({
    onSuccess: (data) => {
      setExtractedText(data.text);
    },
    onError: (error) => {
      alert(`Error processing PDF: ${error.message}`);
    },
  });

  const extractRawFields = api.pdf.extractRawFields.useMutation({
    onSuccess: (data) => {
      setPdfCoResult(data);
    },
    onError: (error) => {
      alert(`Error processing PDF with PDF.co: ${error.message}`);
    },
  });

  const getContextualizedFields = api.pdf.getContextualizedFields.useMutation({
    onSuccess: (data) => {
      setContextualizedFields(data.response ?? "");
    },
    onError: (error) => {
      alert(`Error getting contextualized fields: ${error.message}`);
    },
  });

  const handleProcess = async () => {
    if (pdfUrl) {
      const textResult = await extractText.mutateAsync({ fileUrl: pdfUrl });
      const fieldsResult = await extractRawFields.mutateAsync({
        fileUrl: pdfUrl,
      });

      if (textResult.text && fieldsResult) {
        await getContextualizedFields.mutateAsync({
          text: textResult.text,
          fields: fieldsResult,
          prompt: `You are a helpful assistant that helps people edit PDF Forms through a web interface. Please analyze the provided plain text of the pdf and extracted fields, and return the contextualized FieldsInfo json object with the following format: {
      Fields: Array<{
        PageIndex: number; # copy from original json
        Type: string; # copy from original json
        OriginalFieldName: string; # the original field name as provided in the json file
        Description: string; # a description for the field as provided in the plain text or inferred from context - phrased to help users understand what to enter
        Value: string; # copy from the original json file
        Left: number; # copy from the original json file
        Top: number; # copy from the original json file
        Width: number; # copy from the original json file
        Height: number; # copy from the original json file
      }>;
    };`,
        });
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-24">
      <div className="flex w-full max-w-2xl gap-4">
        <input
          type="text"
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
          className="flex-1 rounded-lg border px-4 py-2"
          placeholder="Enter PDF URL"
        />
        <button
          onClick={handleProcess}
          disabled={
            extractText.isPending ||
            extractRawFields.isPending ||
            getContextualizedFields.isPending
          }
          className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
        >
          {extractText.isPending ||
          extractRawFields.isPending ||
          getContextualizedFields.isPending
            ? "Processing..."
            : "Process PDF"}
        </button>
      </div>

      {(extractText.isPending ||
        extractRawFields.isPending ||
        getContextualizedFields.isPending) && (
        <div className="text-lg">Processing PDF...</div>
      )}

      <div className="grid w-full max-w-4xl grid-cols-3 gap-8">
        <div>
          <h2 className="mb-4 text-xl font-bold">Raw Text Extraction:</h2>
          {extractedText && (
            <pre className="rounded-lg bg-gray-100 p-4 whitespace-pre-wrap">
              {extractedText}
            </pre>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold">PDF.co Fields:</h2>
          {pdfCoResult && (
            <pre className="rounded-lg bg-gray-100 p-4 whitespace-pre-wrap">
              {JSON.stringify(pdfCoResult, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold">Contextualized Fields:</h2>
          {contextualizedFields && (
            <pre className="rounded-lg bg-gray-100 p-4 whitespace-pre-wrap">
              {contextualizedFields}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
