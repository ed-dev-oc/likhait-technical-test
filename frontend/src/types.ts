/**
 * Type definitions for the Expense Tracking System
 */

export interface Category {
  id: number;
  name: string;
  emoji: string;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  category: string;
  category_id?: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedExpenses {
  expenses: Expense[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface ExpenseFormData {
  amount: string;
  description: string;
  category: string;
  category_id?: number;
  date: string;
}

export interface CategorySummary {
  category_id: number;
  category: string;
  emoji: string;
  amount: number;
  count: number;
}

export interface ExpenseSummary {
  total_amount: number;
  total_count: number;
  categories: CategorySummary[];
}

