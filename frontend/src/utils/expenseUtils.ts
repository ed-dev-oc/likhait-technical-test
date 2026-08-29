/**
 * Utility functions for expense calculations and data manipulation
 */

import { Expense } from "../types";

/**
 * Calculate total amount from an array of expenses
 */
export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format date to YYYY-MM-DD
 * Accepts Date or date string to avoid timezone shifting issues
 */
export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    const datePart = date.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    } else {
      return date;
    }
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get days in month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Group expenses by day
 */
export function groupExpensesByDay(expenses: Expense[]) {
  const grouped = new Map<number, Expense[]>();

  expenses.forEach((expense) => {
    let day: number | undefined;

    if (typeof expense.date === "string") {
      const datePart = expense.date.split("T")[0];
      const parts = datePart.split("-");
      if (parts.length === 3) {
        day = parseInt(parts[2], 10);
      }
    }

    if (day !== undefined && !isNaN(day)) {
      const dayExpenses = grouped.get(day) || [];
      dayExpenses.push(expense);
      grouped.set(day, dayExpenses);
    }
  });

  return grouped;
}

