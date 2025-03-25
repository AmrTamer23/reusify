"use client";

import { AnyFieldApi } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  field: AnyFieldApi;
  label: string;
  type?: string;
  placeholder?: string;
}

export function FormField({
  field,
  label,
  type = "text",
  placeholder,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-red-500 mt-1">
          {field.state.meta.errors.join(", ")}
        </p>
      )}
    </div>
  );
}
