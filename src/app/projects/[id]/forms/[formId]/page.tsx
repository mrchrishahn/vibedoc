"use client";

import {
  HomeIcon,
  DocumentIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState, useCallback } from "react";
import { api } from "~/trpc/react";
import PDFViewer from "~/components/PDFViewer";
import FormInput from "~/components/FormInput";
import { generateFilledPDF } from "~/lib/pdf";

export default function FormPage({
  params,
}: {
  params: { id: string; formId: string };
}) {
  const [pendingChanges, setPendingChanges] = useState<Record<number, unknown>>(
    {},
  );

  const formId = parseInt(params.formId);
  const projectId = parseInt(params.id);

  // Fetch form data
  const {
    data: form,
    isLoading,
    error,
  } = api.form.get.useQuery({ id: formId });

  // Mutation for updating inputs
  const updateInputsMutation = api.form.updateMultipleInputs.useMutation({
    onSuccess: () => {
      setPendingChanges({});
      // Optionally show success message
    },
  });

  const handleInputChange = useCallback((inputId: number, value: unknown) => {
    setPendingChanges((prev) => ({
      ...prev,
      [inputId]: value,
    }));
  }, []);

  const handleSave = useCallback(() => {
    const inputs = Object.entries(pendingChanges).map(([id, value]) => ({
      id: parseInt(id),
      value,
    }));

    if (inputs.length > 0) {
      updateInputsMutation.mutate({ inputs });
    }
  }, [pendingChanges, updateInputsMutation]);

  const handleDownloadPDF = useCallback(async () => {
    if (!form) return;

    try {
      // Generate the filled PDF
      const pdfBytes = await generateFilledPDF(
        `/Form-to-fill.pdf`,
        form.inputs.map((input) => ({
          ...input,
          value:
            input.id in pendingChanges ? pendingChanges[input.id] : input.value,
        })),
      );

      // Create a blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${form.fileName.replace(".pdf", "")}-filled.pdf`;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // You might want to show an error message to the user here
    }
  }, [form, pendingChanges]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error ?? !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">
            Error loading form: {error?.message ?? "Form not found"}
          </p>
        </div>
      </div>
    );
  }

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-gray-900"
            >
              <HomeIcon className="h-4 w-4" />
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/projects/${params.id}`}
              className="hover:text-gray-900"
            >
              {form.project.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{form.fileName}</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Form Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                <DocumentIcon className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-semibold">{form.fileName}</h1>
            </div>
            <p className="text-sm text-gray-500">
              {form.inputs.length} inputs found
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!hasChanges || updateInputsMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BookmarkIcon className="h-4 w-4" />
              {updateInputsMutation.isPending ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleDownloadPDF}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Side - PDF Viewer */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">PDF Preview</h2>
            <PDFViewer file="/sample-pdf.pdf" className="h-[800px]" />
          </div>

          {/* Right Side - Form Inputs */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Form Inputs</h2>
            <div className="space-y-6">
              {form.inputs.map((input) => (
                <div
                  key={input.id}
                  className="rounded-lg bg-white p-6 shadow-sm"
                >
                  <FormInput input={input} onValueChange={handleInputChange} />
                </div>
              ))}

              {form.inputs.length === 0 && (
                <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">
                  No inputs found for this form.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
