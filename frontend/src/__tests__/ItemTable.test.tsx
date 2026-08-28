/**
 * Smoke tests for ItemTable component.
 * These tests verify the component renders without crashing.
 * Add more specific tests here as the component evolves.
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ItemTable } from "../vibes/ItemTable";

describe("ItemTable", () => {
  const columns = [
    { key: "name", header: "Name" },
    { key: "amount", header: "Amount" },
  ];

  it("renders the empty state when no data is provided", () => {
    render(<ItemTable columns={columns} data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders a custom empty message", () => {
    render(
      <ItemTable columns={columns} data={[]} emptyMessage="Nothing here" />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    const data = [{ name: "Coffee", amount: "5" }];
    render(<ItemTable columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });

  it("renders row data", () => {
    const data = [{ name: "Coffee", amount: "5" }];
    render(<ItemTable columns={columns} data={data} />);
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("uses a custom render function when provided", () => {
    const columnsWithRender = [
      {
        key: "name",
        header: "Name",
        render: (item: Record<string, unknown>) => (
          <strong>{String(item.name)}</strong>
        ),
      },
    ];
    const data = [{ name: "Tea" }];
    render(<ItemTable columns={columnsWithRender} data={data} />);
    const el = screen.getByText("Tea");
    expect(el.tagName).toBe("STRONG");
  });
});
