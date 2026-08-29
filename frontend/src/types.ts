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

export interface ExpenseFormData {
  amount: string;
  description: string;
  category: string;
  category_id?: number;
  date: string;
}

export interface MonthlySummary {
  totalExpenses: number;
  categoryBreakdown: CategoryBreakdown[];
  topCategories: TopCategory[];
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

export interface TopCategory {
  category: string;
  total: number;
  count: number;
}

export interface DayExpenses {
  day: number;
  expenses: Expense[];
  total: number;
}
