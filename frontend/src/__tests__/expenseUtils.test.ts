import {
  calculateTotal,
  formatCurrency,
  formatDate,
  getDaysInMonth,
  groupExpensesByDay,
} from "../utils/expenseUtils";
import { Expense } from "../types";

describe("expenseUtils", () => {
  describe("calculateTotal", () => {
    it("returns 0 for an empty array", () => {
      expect(calculateTotal([])).toBe(0);
    });

    it("calculates the sum of expense amounts accurately", () => {
      const expenses: Expense[] = [
        {
          id: 1,
          amount: 25.5,
          description: "Lunch",
          category: "Food",
          date: "2026-08-15",
          created_at: "",
          updated_at: "",
        },
        {
          id: 2,
          amount: 14.5,
          description: "Bus",
          category: "Transportation",
          date: "2026-08-15",
          created_at: "",
          updated_at: "",
        },
      ];
      expect(calculateTotal(expenses)).toBe(40);
    });
  });

  describe("formatCurrency", () => {
    it("formats a number to 2 decimal places with a dollar sign", () => {
      expect(formatCurrency(12.5)).toBe("$12.50");
      expect(formatCurrency(0)).toBe("$0.00");
      expect(formatCurrency(100)).toBe("$100.00");
    });
  });

  describe("formatDate", () => {
    it("returns the exact date string when given a YYYY-MM-DD string", () => {
      expect(formatDate("2026-08-15")).toBe("2026-08-15");
      expect(formatDate("2024-01-01")).toBe("2024-01-01");
      expect(formatDate("2025-12-31")).toBe("2025-12-31");
    });

    it("extracts the date part from an ISO date string", () => {
      expect(formatDate("2026-08-15T00:00:00.000Z")).toBe("2026-08-15");
      expect(formatDate("2026-08-15T18:30:00+08:00")).toBe("2026-08-15");
    });

    it("formats a Date object to YYYY-MM-DD using local time components", () => {
      const date = new Date(2026, 7, 15); // Note: month index 7 is August
      expect(formatDate(date)).toBe("2026-08-15");
    });
  });

  describe("getDaysInMonth", () => {
    it("returns correct number of days for various months", () => {
      expect(getDaysInMonth(2026, 1)).toBe(31); // January
      expect(getDaysInMonth(2026, 2)).toBe(28); // Feb 2026 (non-leap)
      expect(getDaysInMonth(2024, 2)).toBe(29); // Feb 2024 (leap year)
      expect(getDaysInMonth(2026, 4)).toBe(30); // April
    });
  });

  describe("groupExpensesByDay", () => {
    it("groups expenses by their day component without timezone shift", () => {
      const expenses: Expense[] = [
        {
          id: 1,
          amount: 10,
          description: "Coffee",
          category: "Food",
          date: "2026-08-01",
          created_at: "",
          updated_at: "",
        },
        {
          id: 2,
          amount: 20,
          description: "Lunch",
          category: "Food",
          date: "2026-08-01",
          created_at: "",
          updated_at: "",
        },
        {
          id: 3,
          amount: 50,
          description: "Groceries",
          category: "Food",
          date: "2026-08-15",
          created_at: "",
          updated_at: "",
        },
      ];

      const grouped = groupExpensesByDay(expenses);
      expect(grouped.get(1)?.length).toBe(2);
      expect(grouped.get(15)?.length).toBe(1);
      expect(grouped.get(14)).toBeUndefined();
    });
  });
});
