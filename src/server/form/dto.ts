export type FormDto = {
  formId: string;
  formName: string;
  rawFormText?: string;
  fields: FieldDto<FieldType>[];
};

type FieldType =
  | "text-long"
  | "text-short"
  | "number"
  | "date"
  | "checkbox"
  | "dropdown";

export type FieldDto<T extends FieldType> = {
  fieldId: string;
  name: string;
  instruction: string;
  required: boolean;
  type: T;
  options: T extends "dropdown" ? string[] : never;
  value: T extends "checkbox" ? boolean : string | number | Date | null;
};
