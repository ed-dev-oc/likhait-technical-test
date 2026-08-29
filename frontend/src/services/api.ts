/**
 * API service for communicating with the backend
 */

import { Category, Expense, ExpenseFormData, ExpenseSummary, PaginatedExpenses } from "../types";

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
  page?: number,
  perPage?: number,
): Promise<Expense[]> {
  const params = new URLSearchParams();
  params.set("year", year.toString());
  params.set("month", month.toString());
  if (page !== undefined) params.set("page", page.toString());
  if (perPage !== undefined) params.set("per_page", perPage.toString());

  const response = await fetch(`${API_BASE_URL}/expenses?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

/**
 * Fetch paginated expenses along with pagination metadata from headers
 */
export async function fetchPaginatedExpenses(
  year: number,
  month: number,
  page: number = 1,
  perPage: number = 10,
): Promise<PaginatedExpenses> {
  const params = new URLSearchParams({
    year: year.toString(),
    month: month.toString(),
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/expenses?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }

  const expenses: Expense[] = await response.json();
  const totalCount = parseInt(response.headers.get("X-Total-Count") || "0", 10) || expenses.length;
  const totalPages = parseInt(response.headers.get("X-Total-Pages") || "1", 10) || 1;
  const currentPage = parseInt(response.headers.get("X-Current-Page") || page.toString(), 10) || page;
  const parsedPerPage = parseInt(response.headers.get("X-Per-Page") || perPage.toString(), 10) || perPage;

  return {
    expenses,
    totalCount,
    totalPages,
    currentPage,
    perPage: parsedPerPage,
  };
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
