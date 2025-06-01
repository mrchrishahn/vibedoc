"use client";

import { type ProjectListItemDto } from "~/server/models/project/ProjectResponse";
import { TrashIcon } from "@heroicons/react/24/outline";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProjectCardProps {
  project: ProjectListItemDto;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const utils = api.useUtils();
  const router = useRouter();
  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => {
      void utils.project.list.invalidate();
    },
  });

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject.mutateAsync({ id: project.id });
    }
  };


  return (
    <Link
      href={`/projects/${project.id}`}
      className="relative block rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
    >
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
      <h3 className="mb-2 text-xl font-semibold">{project.name}</h3>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>{project.documentCount} additional documents</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Created {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
