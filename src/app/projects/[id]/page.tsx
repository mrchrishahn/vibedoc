"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { EditSystemPromptModal } from "./EditSystemPromptModal";
import type { ProjectDocumentDto } from "~/server/models/project/ProjectResponse";
import { HomeIcon, PlusIcon } from "@heroicons/react/24/outline";
import { AddCard, FileCard } from "../../../components/ui/card";
import Link from "next/link";
import { DocumentIcon } from "@heroicons/react/24/outline";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isEditPromptOpen, setIsEditPromptOpen] = useState(false);

  const { data: project, isLoading } = api.project.get.useQuery(
    { id: parseInt(params.id, 10) },
    {
      refetchOnWindowFocus: false,
    },
  );

  const handleHomeClick = () => {
    router.push("/projects");
  };

  const handleAddDocument = () => {
    // TODO: Implement document upload
    console.log("Add document clicked");
  };

  const handleDeleteDocument = (docId: string) => {
    // TODO: Implement document deletion
    console.log("Delete document", docId);
  };

  const handleAddForm = () => {
    // TODO: Implement form upload
    console.log("Add form clicked");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

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
            <span className="text-gray-900">Example Project</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* System Prompt */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">System Prompt</h2>
          <div
            className="cursor-pointer rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            onClick={() => setIsEditPromptOpen(true)}
          >
            <p className="text-gray-600">
              {project.systemPrompt || "Click to add a system prompt..."}
            </p>
          </div>
        </section>

        {/* Documents */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Documents</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AddCard
              icon={<PlusIcon className="h-5 w-5" />}
              title="Add file"
              subtitle="Upload a document or image"
              onClick={handleAddDocument}
            />
            <FileCard
              icon={<DocumentIcon className="h-5 w-5" />}
              fileName="daimler-filled-out.pdf"
              fileType="PDF"
              onDelete={() => handleDeleteDocument("1")}
            />
            <FileCard
              icon={<DocumentIcon className="h-5 w-5" />}
              fileName="another-document.jpg"
              fileType="JPG"
              onDelete={() => handleDeleteDocument("2")}
            />
          </div>
        </section>

        {/* Forms */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Forms</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AddCard
              icon={<PlusIcon className="h-5 w-5" />}
              title="Add Form"
              subtitle="Upload a PDF form to edit"
              onClick={handleAddForm}
            />
            <Link href={`/projects/${params.id}/forms/1`}>
              <FileCard
                icon={<DocumentIcon className="h-5 w-5" />}
                fileName="Form-to-fill.pdf"
                fileType="PDF"
                badge={
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    20 inputs found
                  </span>
                }
              />
            </Link>
          </div>
        </section>
      </main>

      <EditSystemPromptModal
        isOpen={isEditPromptOpen}
        onClose={() => setIsEditPromptOpen(false)}
        projectId={parseInt(params.id, 10)}
        currentPrompt={project.systemPrompt ?? ""}
      />
    </div>
  );
}
