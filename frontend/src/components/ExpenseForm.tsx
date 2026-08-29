import React from "react";
import { Category, ExpenseFormData } from "../types";
import { TextField, SelectBox, Button } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { formatDate } from "../utils/expenseUtils";
import { COLORS } from "../constants/colors";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  categories?: (Category | string)[];
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  categories = [],
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const handleFormSubmit = async (data: ExpenseFormData) => {
    // Resolve category_id from the category list
    let categoryId = data.category_id;
    if (!categoryId && data.category) {
      const matched = categories.find((c) =>
        typeof c === "object" ? c.name === data.category : c === data.category,
      );
      if (matched && typeof matched === "object") {
        categoryId = matched.id;
      }
    }

    await onSubmit({
      ...data,
      category_id: categoryId,
    });
  };

  const { formData, errors, serverError, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit: handleFormSubmit,
    });

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

  const serverErrorStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    backgroundColor: COLORS.red.re02,
    border: `1px solid ${COLORS.danger}`,
    borderRadius: "0.375rem",
    color: COLORS.red.re10,
    fontSize: "0.875rem",
    fontWeight: 500,
  };

  const categoryNameList = categories.map((c) => (typeof c === "object" ? c.name : c));

  const allCategoryNames =
    formData.category && !categoryNameList.includes(formData.category)
      ? [formData.category, ...categoryNameList]
      : categoryNameList;

  const categoryOptions = allCategoryNames.map((categoryName) => {
    const matched = categories.find((c) =>
      typeof c === "object" ? c.name === categoryName : c === categoryName,
    );
    const emoji = matched && typeof matched === "object" && matched.emoji ? `${matched.emoji} ` : "";
    return {
      value: categoryName,
      label: `${emoji}${categoryName}`,
    };
  });

  return (
    <form onSubmit={handleSubmit} style={formStyle} noValidate>
      {serverError && <div style={serverErrorStyle}>{serverError}</div>}

      <TextField
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={formData.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        error={errors.amount}
        fullWidth
        required
      />

      <TextField
        label="Description"
        type="text"
        placeholder="Enter description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        error={errors.description}
        fullWidth
        required
      />

      <SelectBox
        label="Category"
        options={categoryOptions}
        value={formData.category}
        onChange={(e) => handleChange("category", e.target.value)}
        error={errors.category}
        fullWidth
        required
      />

      <TextField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => handleChange("date", e.target.value)}
        max={formatDate(new Date())}
        error={errors.date}
        fullWidth
        required
      />

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Submitting..." : submitLabel}
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
