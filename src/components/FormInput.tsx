"use client";

import { useState, useEffect } from "react";
import type { InputDto } from "~/server/models/form/FormDTO";

interface FormInputProps {
  input: InputDto;
  onValueChange: (inputId: number, value: unknown) => void;
}

export default function FormInput({ input, onValueChange }: FormInputProps) {
  const [value, setValue] = useState<unknown>(input.value);

  useEffect(() => {
    setValue(input.value);
  }, [input.value]);

  const handleChange = (newValue: unknown) => {
    setValue(newValue);
    onValueChange(input.id, newValue);
  };

  const getStringValue = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    return "";
  };

  const renderInput = () => {
    switch (input.type) {
      case "CHECKBOX":
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              {input.description}
            </label>
          </div>
        );

      case "SELECT":
        // For now, we'll use a simple select. In a real app, you'd parse options from somewhere
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {input.name}
            </label>
            <select
              value={getStringValue(value)}
              onChange={(e) => handleChange(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>
        );

      case "INPUT":
      default:
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {input.name}
            </label>
            <input
              type="text"
              value={getStringValue(value)}
              onChange={(e) => handleChange(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder={input.description}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {renderInput()}
      <p className="text-sm text-gray-500">
        PDF Element ID: {input.pdfElementId}
      </p>
    </div>
  );
}
