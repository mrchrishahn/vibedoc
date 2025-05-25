"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const utils = api.useUtils();

  const createProject = api.project.create.useMutation({
    onSuccess: () => {
      void utils.project.list.invalidate();
      onClose();
      setProjectName("");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      await createProject.mutateAsync({ name: projectName.trim() });
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  if (!isOpen) return null;

  const isPending = createProject.status === "pending";

  return (
    <>
      <div className="bg-opacity-75 fixed inset-0 z-50 bg-gray-500 transition-opacity" />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create New Project
              </h3>
              <form onSubmit={handleSubmit} className="mt-5">
                <div>
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Project Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="projectName"
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter project name"
                    />
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 sm:col-start-2 sm:text-sm"
                  >
                    {isPending ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:col-start-1 sm:mt-0 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
