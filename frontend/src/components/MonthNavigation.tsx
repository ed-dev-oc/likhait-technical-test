/**
 * Month navigation component
 */

import React, { useEffect, useRef } from "react";
import { COLORS } from "../constants/colors";

interface MonthNavigationProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const MONTHS = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

export function MonthNavigation({
  currentMonth,
  currentYear,
  onMonthChange,
}: MonthNavigationProps) {
  const monthButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const selectedBtn = monthButtonRefs.current[currentMonth];
    if (selectedBtn) {
      selectedBtn.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(12, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(1, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "16px 0",
    width: "100%",
    minWidth: 0,
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: 0,
    overflowX: "auto",
    scrollbarWidth: "none",
    padding: "4px 2px",
  };

  const navigationButtonStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: "16px",
    fontWeight: 500,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    background: COLORS.primary.p05,
    color: "white",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const getMonthButtonStyle = (month: number): React.CSSProperties => ({
    padding: "10px 18px",
    fontSize: "15px",
    fontWeight: 500,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    background: currentMonth === month ? COLORS.primary.p05 : "white",
    color: currentMonth === month ? "white" : COLORS.secondary.s08,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    flex: "1 0 auto",
    minWidth: "64px",
    textAlign: "center",
  });

  return (
    <div style={wrapperStyle}>
      <button
        style={navigationButtonStyle}
        onClick={handlePreviousMonth}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = COLORS.primary.p04;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = COLORS.primary.p05;
        }}
        title="Previous month"
      >
        ←
      </button>
      <div style={containerStyle}>
        {MONTHS.map((month) => (
          <button
            key={month.value}
            ref={(el) => {
              monthButtonRefs.current[month.value] = el;
            }}
            style={getMonthButtonStyle(month.value)}
            onClick={() => onMonthChange(month.value, currentYear)}
            onMouseEnter={(e) => {
              if (currentMonth !== month.value) {
                e.currentTarget.style.background = COLORS.secondary.s02;
              }
            }}
            onMouseLeave={(e) => {
              if (currentMonth !== month.value) {
                e.currentTarget.style.background = "white";
              }
            }}
          >
            {month.label}
          </button>
        ))}
      </div>
      <button
        style={navigationButtonStyle}
        onClick={handleNextMonth}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = COLORS.primary.p04;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = COLORS.primary.p05;
        }}
        title="Next month"
      >
        →
      </button>
    </div>
  );
}
