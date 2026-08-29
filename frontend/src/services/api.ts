/**
 * API service for communicating with the backend
 */

import { Category, Expense, ExpenseFormData, ExpenseSummary } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Fetch all expenses
 */
export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch(`${API_BASE_URL}/expenses`);
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

/**
 * Fetch expenses for a specific year and month
 */
export async function getExpenses(
  year: number,
  month: number,
): Promise<Expense[]> {
  const response = await fetch(
    `${API_BASE_URL}/expenses?year=${year}&month=${month}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

/**
 * Fetch monthly expense summary metrics (total amount, total count, category breakdown)
 */
export async function fetchMonthlySummary(
  year?: number,
  month?: number,
): Promise<ExpenseSummary> {
  const query =
    year !== undefined && month !== undefined
      ? `?year=${year}&month=${month}`
      : "";
  const response = await fetch(`${API_BASE_URL}/expenses/summary${query}`);
  if (!response.ok) {
    throw new Error("Failed to fetch expense summary");
  }
  return response.json();
}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

/**
 * Create a new category
 */
export async function createCategory(
  name: string,
  emoji?: string,
): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category: {
        name,
        emoji: emoji || "📦",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.errors && Array.isArray(errorData.errors)
        ? errorData.errors.join(", ")
        : "Failed to create category";
    throw new Error(message);
  }

  return response.json();
}


/**
 * Create a new expense
 */
export async function createExpense(data: ExpenseFormData): Promise<Expense> {
  let categoryId = data.category_id;

  // Fallback: only lookup by name if category_id was not explicitly provided
  if (!categoryId && data.category) {
    const categories = await fetchCategories();
    const category = categories.find((c) => c.name === data.category);
    categoryId = category?.id;
  }

  const expenseData = {
    description: data.description,
    amount: data.amount,
    category_id: categoryId,
    date: data.date,
  };

  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: expenseData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.errors && Array.isArray(errorData.errors)
        ? errorData.errors.join(", ")
        : "Failed to create expense";
    throw new Error(message);
  }

  return response.json();
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  id: number,
  data: Partial<ExpenseFormData>,
): Promise<Expense> {
  const expenseData: Record<string, unknown> = {};

  if (data.description !== undefined) {
    expenseData.description = data.description;
  }
  if (data.amount !== undefined) {
    expenseData.amount = data.amount;
  }
  if (data.date !== undefined) {
    expenseData.date = data.date;
  }
  if (data.category_id !== undefined) {
    expenseData.category_id = data.category_id;
  } else if (data.category !== undefined) {
    const categories = await fetchCategories();
    const category = categories.find((c) => c.name === data.category);
    expenseData.category_id = category?.id;
  }

  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: expenseData }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.errors && Array.isArray(errorData.errors)
        ? errorData.errors.join(", ")
        : "Failed to update expense";
    throw new Error(message);
  }

  return response.json();
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }
}
