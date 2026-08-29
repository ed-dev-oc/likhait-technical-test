/**
 * Expense category constants
 * @deprecated Categories are dynamically fetched from the backend API.
 * This constant is retained for legacy type compatibility.
 */

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Healthcare",
  "Education",
  "Travel",
  "Personal",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
