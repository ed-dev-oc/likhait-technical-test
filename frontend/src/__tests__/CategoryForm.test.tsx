/**
 * Tests for CategoryForm component.
 *
 * Covers:
 * - Rendering
 * - Client-side validation (required, max-length, duplicate)
 * - Successful submission
 * - Server-side error handling (errors from backend)
 * - Cancel behaviour
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { CategoryForm } from "../components/CategoryForm";

// ─── helpers ─────────────────────────────────────────────────────────────────

const noop = async () => {};
const makeRejecter = (msg: string) => async () => {
  throw new Error(msg);
};

// ─── rendering ───────────────────────────────────────────────────────────────

describe("CategoryForm — rendering", () => {
  it("renders the category name text field", () => {
    render(<CategoryForm onSubmit={noop} />);
    expect(
      screen.getByRole("textbox", { name: /category name/i }),
    ).toBeInTheDocument();
  });

  it("renders the Create Category submit button", () => {
    render(<CategoryForm onSubmit={noop} />);
    expect(
      screen.getByRole("button", { name: /create category/i }),
    ).toBeInTheDocument();
  });

  it("renders a Cancel button when onCancel is provided", () => {
    render(<CategoryForm onSubmit={noop} onCancel={noop} />);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("does NOT render a Cancel button when onCancel is omitted", () => {
    render(<CategoryForm onSubmit={noop} />);
    expect(
      screen.queryByRole("button", { name: /cancel/i }),
    ).not.toBeInTheDocument();
  });
});

// ─── client-side validation ───────────────────────────────────────────────────

describe("CategoryForm — client-side validation", () => {
  it("shows a required error when submitting an empty field", async () => {
    const user = userEvent.setup();
    render(<CategoryForm onSubmit={noop} />);

    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(
      await screen.findByText(/category name is required/i),
    ).toBeInTheDocument();
  });

  it("shows a required error when submitting whitespace only", async () => {
    const user = userEvent.setup();
    render(<CategoryForm onSubmit={noop} />);

    await user.type(screen.getByRole("textbox", { name: /category name/i }), "   ");
    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(
      await screen.findByText(/category name is required/i),
    ).toBeInTheDocument();
  });

  it("shows an error when the name exceeds 100 characters", async () => {
    const user = userEvent.setup();
    render(<CategoryForm onSubmit={noop} />);

    const longName = "A".repeat(101);
    await user.type(screen.getByRole("textbox", { name: /category name/i }), longName);
    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(
      await screen.findByText(/100 characters or less/i),
    ).toBeInTheDocument();
  });

  it("shows a duplicate error when name matches an existing category (case-insensitive)", async () => {
    const user = userEvent.setup();
    render(
      <CategoryForm existingCategories={["Food", "Travel"]} onSubmit={noop} />,
    );

    await user.type(screen.getByRole("textbox", { name: /category name/i }), "food");
    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(
      await screen.findByText(/category already exists/i),
    ).toBeInTheDocument();
  });

  it("shows an error when emoji input is non-emoji text", async () => {
    const user = userEvent.setup();
    render(<CategoryForm onSubmit={noop} />);

    await user.type(screen.getByRole("textbox", { name: /category name/i }), "Music");
    const emojiInput = screen.getByRole("textbox", { name: /category emoji/i });
    await user.clear(emojiInput);
    await user.type(emojiInput, "text");
    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(
      await screen.findByText(/single valid emoji/i),
    ).toBeInTheDocument();
  });

  it("shows an error when emoji input has multiple emojis", async () => {
    const user = userEvent.setup();
    render(<CategoryForm onSubmit={noop} />);

    await user.type(screen.getByRole("textbox", { name: /category name/i }), "Music");
    const emojiInput = screen.getByRole("textbox", { name: /category emoji/i });
    await user.clear(emojiInput);
    await user.type(emojiInput, "🍔🍕");
    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(
      await screen.findByText(/single valid emoji/i),
    ).toBeInTheDocument();
  });

  it("clears the error message when the user starts typing after a validation failure", async () => {
    const user = userEvent.setup();
    render(<CategoryForm onSubmit={noop} />);

    // trigger a validation error first
    await user.click(screen.getByRole("button", { name: /create category/i }));
    expect(
      await screen.findByText(/category name is required/i),
    ).toBeInTheDocument();

    // typing should clear the error
    await user.type(screen.getByRole("textbox", { name: /category name/i }), "Subscriptions");
    expect(
      screen.queryByText(/category name is required/i),
    ).not.toBeInTheDocument();
  });
});


// ─── successful submission ────────────────────────────────────────────────────

describe("CategoryForm — successful submission", () => {
  it("calls onSubmit with the trimmed category name and default emoji", async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CategoryForm onSubmit={mockSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: /category name/i }),
      "  Subscriptions  ",
    );
    await user.click(screen.getByRole("button", { name: /create category/i }));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledWith("Subscriptions", "📦"));
  });

  it("calls onSubmit with custom selected emoji", async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CategoryForm onSubmit={mockSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: /category name/i }),
      "Gaming",
    );
    await user.click(screen.getByRole("button", { name: "🎮" }));
    await user.click(screen.getByRole("button", { name: /create category/i }));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledWith("Gaming", "🎮"));
  });

  it("shows 'Creating...' label on the submit button while submitting", async () => {
    const user = userEvent.setup();
    // Never resolves so we can observe the loading state
    const pendingSubmit = () => new Promise<void>(() => {});
    render(<CategoryForm onSubmit={pendingSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: /category name/i }),
      "Gardening",
    );
    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(
      await screen.findByRole("button", { name: /creating\.\.\./i }),
    ).toBeInTheDocument();
  });
});


// ─── server-side error handling ───────────────────────────────────────────────

describe("CategoryForm — server-side error handling", () => {
  it("shows the server error message when onSubmit rejects", async () => {
    const user = userEvent.setup();
    render(
      <CategoryForm onSubmit={makeRejecter("Name has already been taken")} />,
    );

    await user.type(
      screen.getByRole("textbox", { name: /category name/i }),
      "Groceries",
    );
    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(
      await screen.findByText(/name has already been taken/i),
    ).toBeInTheDocument();
  });

  it("shows a fallback error when onSubmit rejects without a message", async () => {
    const user = userEvent.setup();
    const badSubmit = async () => {
      throw {};
    };
    render(<CategoryForm onSubmit={badSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: /category name/i }),
      "Gardening",
    );
    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(
      await screen.findByText(/failed to create category/i),
    ).toBeInTheDocument();
  });
});

// ─── cancel behaviour ─────────────────────────────────────────────────────────

describe("CategoryForm — cancel behaviour", () => {
  it("calls onCancel when the Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const mockCancel = jest.fn();
    render(<CategoryForm onSubmit={noop} onCancel={mockCancel} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
});
