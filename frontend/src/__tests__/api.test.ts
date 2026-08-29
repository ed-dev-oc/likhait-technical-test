import {
  fetchCategories,
  createCategory,
  fetchExpenses,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/api";

const mockCategories = [
  { id: 1, name: "Food", emoji: "🍔" },
  { id: 2, name: "Transport", emoji: "🚗" },
];

describe("api service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  describe("fetchCategories", () => {
    it("fetches categories from /api/categories", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      });

      const categories = await fetchCategories();
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/categories");
      expect(categories).toEqual(mockCategories);
    });

    it("throws an error when request fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchCategories()).rejects.toThrow("Failed to fetch categories");
    });
  });

  describe("createCategory", () => {
    it("creates a new category with POST request", async () => {
      const newCategory = { id: 3, name: "Books", emoji: "📚" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => newCategory,
      });

      const result = await createCategory("Books", "📚");
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: { name: "Books", emoji: "📚" } }),
      });
      expect(result).toEqual(newCategory);
    });
  });

  describe("fetchExpenses & getExpenses", () => {
    it("fetches all expenses", async () => {
      const mockExpenses = [{ id: 1, description: "Lunch", amount: 20, category: "Food", date: "2026-08-15" }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExpenses,
      });

      const result = await fetchExpenses();
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/expenses");
      expect(result).toEqual(mockExpenses);
    });

    it("fetches expenses filtered by year and month", async () => {
      const mockExpenses = [{ id: 1, description: "Lunch", amount: 20, category: "Food", date: "2026-08-15" }];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExpenses,
      });

      const result = await getExpenses(2026, 8);
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/expenses?year=2026&month=8");
      expect(result).toEqual(mockExpenses);
    });
  });

  describe("createExpense", () => {
    it("posts category_id directly without making an extra fetchCategories call", async () => {
      const createdExpense = {
        id: 10,
        description: "Dinner",
        amount: 50,
        category: "Food",
        category_id: 1,
        date: "2026-08-15",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdExpense,
      });

      const result = await createExpense({
        description: "Dinner",
        amount: "50",
        category: "Food",
        category_id: 1,
        date: "2026-08-15",
      });

      // Exactly 1 fetch call: only POST /api/expenses, NO GET /api/categories
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expense: {
            description: "Dinner",
            amount: "50",
            category_id: 1,
            date: "2026-08-15",
          },
        }),
      });
      expect(result).toEqual(createdExpense);
    });

    it("falls back to category lookup if category_id is missing", async () => {
      // 1st call: GET /api/categories
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategories,
      });
      // 2nd call: POST /api/expenses
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 11, description: "Bus", amount: 5, category: "Transport", category_id: 2, date: "2026-08-15" }),
      });

      await createExpense({
        description: "Bus",
        amount: "5",
        category: "Transport",
        date: "2026-08-15",
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("updateExpense", () => {
    it("updates expense directly when category_id is provided without extra fetchCategories", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 5, description: "Updated", amount: 30, category_id: 2, date: "2026-08-15" }),
      });

      await updateExpense(5, {
        description: "Updated",
        amount: "30",
        category_id: 2,
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/expenses/5", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expense: {
            description: "Updated",
            amount: "30",
            category_id: 2,
          },
        }),
      });
    });
  });

  describe("deleteExpense", () => {
    it("sends DELETE request to /api/expenses/:id", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await deleteExpense(7);
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/expenses/7", {
        method: "DELETE",
      });
    });
  });
});
