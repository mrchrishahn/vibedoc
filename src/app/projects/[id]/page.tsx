"use client";

import { useState, use } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { EditSystemPromptModal } from "./EditSystemPromptModal";
import type { ProjectDocumentDto } from "~/server/models/project/ProjectResponse";
import { HomeIcon, PlusIcon } from "@heroicons/react/24/outline";
import { AddCard, FileCard } from "../../../components/ui/card";
import Link from "next/link";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { UploadButton } from "~/utils/uploadthing";
import { toast } from "sonner";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [isEditPromptOpen, setIsEditPromptOpen] = useState(false);
  const utils = api.useUtils();

  const unwrappedParams = use(params);
  const projectId = parseInt(unwrappedParams.id, 10);

  const { data: project, isLoading } = api.project.get.useQuery(
    { id: projectId },
    {
      refetchOnWindowFocus: false,
    },
  );

  const uploadDocumentMutation = api.project.uploadDocument.useMutation({
    onSuccess: () => {
      void utils.project.get.invalidate({ id: projectId });
    },
  });

  const createFormMutation = api.project.createForm.useMutation({
    onSuccess: () => {
      void utils.project.get.invalidate({ id: projectId });
    },
  });

  const deleteDocumentMutation = api.project.deleteDocument.useMutation({
    onSuccess: () => {
      void utils.project.get.invalidate({ id: projectId });
    },
  });

  const handleHomeClick = () => {
    router.push("/projects");
  };

  const handleDeleteDocument = async (docId: number) => {
    try {
      await deleteDocumentMutation.mutateAsync({ id: docId });
      toast("Document deleted successfully");
    } catch {
      toast("Failed to delete document");
    }
  };

  const handleAddForm = () => {
    // Programmatically click the hidden upload button
    const uploadButton = document.querySelector<HTMLElement>(
      "#form-upload-button",
    );
    uploadButton?.click();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white px-4 py-3">
        <button
          onClick={handleHomeClick}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <HomeIcon className="h-5 w-5" />
          Back to Projects
        </button>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <div className="mt-4">
            <Button
              onClick={() => setIsEditPromptOpen(true)}
              variant="outline"
              size="sm"
            >
              Edit System Prompt
            </Button>
          </div>
        </div>

        {/* Documents */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Documents</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <UploadButton
              endpoint="pdfUploader"
              appearance={{
                button:
                  "rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 transition-colors w-full h-full",
                container: "w-full h-full",
              }}
              content={{
                button() {
                  return (
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                        <PlusIcon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900">Add file</h3>
                        <p className="text-sm text-gray-500">
                          Upload a document or image
                        </p>
                      </div>
                    </div>
                  );
                },
              }}
              onClientUploadComplete={async (res) => {
                if (!res?.[0]) return;

                const file = res[0];
                try {
                  await uploadDocumentMutation.mutateAsync({
                    projectId,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    cloudName: file.key,
                  });
                  toast("Document uploaded successfully");
                } catch {
                  toast("Failed to upload document");
                }
              }}
              onUploadError={() => {
                toast("Failed to upload file");
              }}
            />
            {project.additionalDocuments.map((doc) => (
              <FileCard
                key={doc.id}
                icon={<DocumentIcon className="h-5 w-5" />}
                fileName={doc.fileName}
                fileType={doc.fileType}
                onDelete={() => void handleDeleteDocument(doc.id)}
              />
            ))}
          </div>
        </section>

        {/* Forms */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Forms</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <UploadButton
              endpoint="pdfUploader"
              appearance={{
                button:
                  "w-full h-full rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 transition-colors bg-white",
                container: "w-full h-full",
              }}
              content={{
                button() {
                  return (
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                        <PlusIcon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900">Add Form</h3>
                        <p className="text-sm text-gray-500">
                          Upload a PDF form to edit
                        </p>
                      </div>
                    </div>
                  );
                },
              }}
              onClientUploadComplete={async (res) => {
                if (!res?.[0]) return;

                const file = res[0];
                try {
                  await createFormMutation.mutateAsync({
                    projectId,
                    name: file.name,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    cloudName: file.key,
                  });
                  toast("Form uploaded successfully");
                } catch {
                  toast("Failed to upload form");
                }
              }}
              onUploadError={() => {
                toast("Failed to upload file");
              }}
            />
            {project.forms?.map((form) => (
              <Link
                key={form.id}
                href={`/projects/${projectId}/forms/${form.id}`}
              >
                <FileCard
                  icon={<DocumentIcon className="h-5 w-5" />}
                  fileName={form.fileName}
                  fileType={form.fileType}
                  badge={
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {form.inputs?.length ?? 0} inputs found
                    </span>
                  }
                />
              </Link>
            ))}
          </div>
        </section>
      </main>

      <EditSystemPromptModal
        isOpen={isEditPromptOpen}
        onClose={() => setIsEditPromptOpen(false)}
        projectId={projectId}
        currentPrompt={project.systemPrompt ?? ""}
      />
    </div>
  );
}
