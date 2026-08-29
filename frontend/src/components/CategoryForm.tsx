/**
 * Form component for creating new expense categories
 */

import React, { useState } from "react";
import { TextField, Button } from "../vibes";

interface CategoryFormProps {
  existingCategories?: string[];
  onSubmit: (name: string, emoji?: string) => Promise<void>;
  onCancel?: () => void;
}

const COMMON_EMOJIS = ["📦", "🍔", "🚗", "🛍️", "🎬", "📄", "🏥", "📚", "✈️", "👤", "💻", "🎮", "🏋️", "☕", "🎨", "🐾"];

export function CategoryForm({
  existingCategories = [],
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📦");
  const [nameError, setNameError] = useState("");
  const [emojiError, setEmojiError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmoji = emoji.trim() || "📦";

    let hasError = false;

    if (!trimmedName) {
      setNameError("Category name is required");
      hasError = true;
    } else if (trimmedName.length > 100) {
      setNameError("Category name must be 100 characters or less");
      hasError = true;
    } else {
      const isDuplicate = existingCategories.some(
        (cat) => cat.toLowerCase() === trimmedName.toLowerCase(),
      );
      if (isDuplicate) {
        setNameError("Category already exists");
        hasError = true;
      }
    }

    const segmenter =
      typeof Intl !== "undefined" &&
      typeof (Intl as unknown as { Segmenter?: new (locales?: string, options?: { granularity: string }) => { segment: (input: string) => Iterable<{ segment: string }> } }).Segmenter === "function"
        ? new (Intl as unknown as { Segmenter: new (locales?: string, options?: { granularity: string }) => { segment: (input: string) => Iterable<{ segment: string }> } }).Segmenter(undefined, { granularity: "grapheme" })
        : null;

    const segments = segmenter
      ? Array.from(segmenter.segment(trimmedEmoji))
      : Array.from(trimmedEmoji);

    const isSingleEmoji =
      segments.length === 1 &&
      /\p{Extended_Pictographic}|\p{Emoji}/u.test(trimmedEmoji);

    if (!isSingleEmoji) {
      setEmojiError("Please enter a single valid emoji");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsSubmitting(true);
      setNameError("");
      setEmojiError("");
      setServerError("");
      await onSubmit(trimmedName, trimmedEmoji);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Failed to create category");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const serverErrorStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    backgroundColor: "#fee2e2",
    border: "1px solid #ef4444",
    borderRadius: "0.375rem",
    color: "#991b1b",
    fontSize: "0.875rem",
    fontWeight: 500,
  };

  const emojiContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const emojiListStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "4px",
  };

  const emojiButtonStyle = (selected: boolean): React.CSSProperties => ({
    padding: "6px 10px",
    fontSize: "1.25rem",
    borderRadius: "6px",
    border: selected ? "2px solid #2563eb" : "1px solid #e2e8f0",
    backgroundColor: selected ? "#eff6ff" : "#ffffff",
    cursor: "pointer",
    transition: "all 0.15s ease-in-out",
  });

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {serverError && <div style={serverErrorStyle}>{serverError}</div>}

      <TextField
        label="Category Name"
        type="text"
        placeholder="e.g. Subscriptions"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (nameError) setNameError("");
          if (serverError) setServerError("");
        }}
        error={nameError}
        fullWidth
        autoFocus
      />

      <div style={emojiContainerStyle}>
        <TextField
          label="Category Emoji"
          type="text"
          placeholder="e.g. 📦"
          value={emoji}
          onChange={(e) => {
            setEmoji(e.target.value);
            if (emojiError) setEmojiError("");
            if (serverError) setServerError("");
          }}
          error={emojiError}
          fullWidth
        />
        <div style={emojiListStyle}>
          {COMMON_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              style={emojiButtonStyle(emoji === e)}
              onClick={() => {
                setEmoji(e);
                if (emojiError) setEmojiError("");
                if (serverError) setServerError("");
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Creating..." : "Create Category"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}


