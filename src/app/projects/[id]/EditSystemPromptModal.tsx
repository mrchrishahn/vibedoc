"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";

interface EditSystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  currentPrompt: string;
}

export function EditSystemPromptModal({
  isOpen,
  onClose,
  projectId,
  currentPrompt,
}: EditSystemPromptModalProps) {
  const [prompt, setPrompt] = useState(currentPrompt);
  const router = useRouter();
  const utils = api.useUtils();

  // Update local state when currentPrompt changes
  useEffect(() => {
    setPrompt(currentPrompt);
  }, [currentPrompt]);

  const updateSystemPrompt = api.project.updateSystemPrompt.useMutation({
    onSuccess: () => {
      void utils.project.get.invalidate({ id: projectId });
      onClose();
    },
  });

  const handleSave = () => {
    updateSystemPrompt.mutate({
      id: projectId,
      systemPrompt: prompt,
    });
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit System Prompt</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={prompt}
            onChange={handleChange}
            placeholder="Enter system prompt..."
            className="min-h-[200px]"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateSystemPrompt.isPending}>
            {updateSystemPrompt.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
