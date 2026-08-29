import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CategoryBreakdown from "../components/CategoryBreakdown";

describe("CategoryBreakdown", () => {
  it("renders total amount and transactions count correctly", () => {
    render(
      <CategoryBreakdown
        categories={[]}
        total={0}
        totalCount={0}
      />
    );

    expect(screen.getByText("TOTAL:")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByText("(0 transactions)")).toBeInTheDocument();
  });

  it("displays 'No expenses for this month.' when expanded with empty categories", () => {
    render(
      <CategoryBreakdown
        categories={[]}
        total={0}
        totalCount={0}
      />
    );

    // Initial state is collapsed, so empty text shouldn't be visible
    expect(screen.queryByText("No expenses for this month.")).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByRole("button", { name: /expand/i }));

    // Empty state message should now be visible
    expect(screen.getByText("No expenses for this month.")).toBeInTheDocument();
  });

  it("displays categories list when expanded with category items", () => {
    const mockCategories = [
      { category: "Food", amount: 150.5, count: 3, emoji: "🍔" },
      { category: "Transport", amount: 45.0, count: 2, emoji: "🚗" },
    ];

    render(
      <CategoryBreakdown
        categories={mockCategories}
        total={195.5}
        totalCount={5}
      />
    );

    // Click to expand
    fireEvent.click(screen.getByRole("button", { name: /expand/i }));

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("3 transactions")).toBeInTheDocument();
    expect(screen.getByText("$150.50")).toBeInTheDocument();

    expect(screen.getByText("Transport")).toBeInTheDocument();
    expect(screen.getByText("2 transactions")).toBeInTheDocument();
    expect(screen.getByText("$45.00")).toBeInTheDocument();

    expect(screen.queryByText("No expenses for this month.")).not.toBeInTheDocument();
  });
});
