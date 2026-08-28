/**
 * Tests for ExpenseForm component and future date validation (BONUS-001).
 *
 * Covers:
 * - Rendering default values and max attribute
 * - Editing initial data
 * - Future date validation and error display
 * - Required field validations
 * - Successful submission
 * - Cancel behaviour
 */

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { ExpenseForm } from "../components/ExpenseForm";
import { formatDate } from "../utils/expenseUtils";

const noop = async () => {};
const today = formatDate(new Date());

const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrow = formatDate(tomorrowDate);

const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterday = formatDate(yesterdayDate);

describe("ExpenseForm — rendering & defaults", () => {
  it("defaults the date input to today's date", () => {
    render(<ExpenseForm onSubmit={noop} />);
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
    expect(dateInput.value).toBe(today);
  });

  it("sets the max attribute on the date input to today's date to prevent future selection", () => {
    render(<ExpenseForm onSubmit={noop} />);
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
    expect(dateInput.getAttribute("max")).toBe(today);
  });

  it("populates initial data when provided", () => {
    render(
      <ExpenseForm
        initialData={{
          amount: "45.50",
          description: "Team Dinner",
          category: "Food",
          date: yesterday,
        }}
        onSubmit={noop}
      />,
    );

    expect((screen.getByLabelText(/amount/i) as HTMLInputElement).value).toBe("45.50");
    expect((screen.getByLabelText(/description/i) as HTMLInputElement).value).toBe("Team Dinner");
    expect((screen.getByLabelText(/date/i) as HTMLInputElement).value).toBe(yesterday);
  });
});

describe("ExpenseForm — date validation (BONUS-001)", () => {
  it("shows an error and blocks submission when a future date is entered", async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <ExpenseForm
        categories={["Food"]}
        onSubmit={mockSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/amount/i), "25.00");
    await user.type(screen.getByLabelText(/description/i), "Movie Ticket");
    await user.selectOptions(screen.getByRole("combobox"), "Food");

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: tomorrow } });

    await user.click(screen.getByRole("button", { name: /add expense/i }));

    expect(
      await screen.findByText(/expense date cannot be in the future/i),
    ).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("shows an error when date field is empty", async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <ExpenseForm
        categories={["Food"]}
        onSubmit={mockSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/amount/i), "25.00");
    await user.type(screen.getByLabelText(/description/i), "Movie Ticket");
    await user.selectOptions(screen.getByRole("combobox"), "Food");

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: "" } });

    await user.click(screen.getByRole("button", { name: /add expense/i }));

    expect(await screen.findByText(/date is required/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("clears the date error when user modifies the date field", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm categories={["Food"]} onSubmit={noop} />);

    await user.type(screen.getByLabelText(/amount/i), "10");
    await user.type(screen.getByLabelText(/description/i), "Snack");
    await user.selectOptions(screen.getByRole("combobox"), "Food");

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: tomorrow } });

    await user.click(screen.getByRole("button", { name: /add expense/i }));

    expect(
      await screen.findByText(/expense date cannot be in the future/i),
    ).toBeInTheDocument();

    fireEvent.change(dateInput, { target: { value: today } });

    expect(
      screen.queryByText(/expense date cannot be in the future/i),
    ).not.toBeInTheDocument();
  });
});

describe("ExpenseForm — successful submission", () => {
  it("submits successfully with today's date", async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <ExpenseForm
        categories={["Food"]}
        onSubmit={mockSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/amount/i), "35.5");
    await user.type(screen.getByLabelText(/description/i), "Groceries");
    await user.selectOptions(screen.getByRole("combobox"), "Food");

    await user.click(screen.getByRole("button", { name: /add expense/i }));

    await waitFor(() =>
      expect(mockSubmit).toHaveBeenCalledWith({
        amount: "35.5",
        description: "Groceries",
        category: "Food",
        date: today,
      }),
    );
  });

  it("submits successfully with a past date", async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <ExpenseForm
        categories={["Transport"]}
        onSubmit={mockSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/amount/i), "12");
    await user.type(screen.getByLabelText(/description/i), "Bus Pass");
    await user.selectOptions(screen.getByRole("combobox"), "Transport");

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: yesterday } });

    await user.click(screen.getByRole("button", { name: /add expense/i }));

    await waitFor(() =>
      expect(mockSubmit).toHaveBeenCalledWith({
        amount: "12",
        description: "Bus Pass",
        category: "Transport",
        date: yesterday,
      }),
    );
  });
});

describe("ExpenseForm — server-side error handling", () => {
  it("displays server error message when submission fails", async () => {
    const user = userEvent.setup();
    const rejecter = jest.fn().mockRejectedValue(new Error("Date cannot be in the future"));

    render(
      <ExpenseForm
        categories={["Food"]}
        onSubmit={rejecter}
      />,
    );

    await user.type(screen.getByLabelText(/amount/i), "20");
    await user.type(screen.getByLabelText(/description/i), "Lunch");
    await user.selectOptions(screen.getByRole("combobox"), "Food");

    await user.click(screen.getByRole("button", { name: /add expense/i }));

    expect(
      await screen.findByText(/date cannot be in the future/i),
    ).toBeInTheDocument();
  });

  it("clears server error message when user starts typing", async () => {
    const user = userEvent.setup();
    const rejecter = jest.fn().mockRejectedValue(new Error("Internal error"));

    render(
      <ExpenseForm
        categories={["Food"]}
        onSubmit={rejecter}
      />,
    );

    await user.type(screen.getByLabelText(/amount/i), "20");
    await user.type(screen.getByLabelText(/description/i), "Lunch");
    await user.selectOptions(screen.getByRole("combobox"), "Food");

    await user.click(screen.getByRole("button", { name: /add expense/i }));

    expect(await screen.findByText(/internal error/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/description/i), " more");

    expect(screen.queryByText(/internal error/i)).not.toBeInTheDocument();
  });
});

describe("ExpenseForm — cancel button", () => {
  it("renders cancel button and triggers onCancel", async () => {
    const user = userEvent.setup();
    const mockCancel = jest.fn();

    render(<ExpenseForm onSubmit={noop} onCancel={mockCancel} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
});
