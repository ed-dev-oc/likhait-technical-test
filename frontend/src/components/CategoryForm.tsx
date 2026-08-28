/**
 * Form component for creating new expense categories
 */

import React, { useState } from "react";
import { TextField, Button } from "../vibes";

interface CategoryFormProps {
  existingCategories?: string[];
  onSubmit: (name: string) => Promise<void>;
  onCancel?: () => void;
}

export function CategoryForm({
  existingCategories = [],
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Category name must be 100 characters or less");
      return;
    }

    const isDuplicate = existingCategories.some(
      (cat) => cat.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      setError("Category already exists");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await onSubmit(trimmedName);
    } catch (err: any) {
      setError(err?.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <TextField
        label="Category Name"
        type="text"
        placeholder="e.g. Subscriptions"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError("");
        }}
        error={error}
        fullWidth
        autoFocus
      />

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Creating..." : "Create Category"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
