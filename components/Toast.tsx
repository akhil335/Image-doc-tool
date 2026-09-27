"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string | null;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: ToastProps) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 200);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-sm border px-4 py-3 font-mono text-[13px] shadow-lg transition-all duration-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      } ${
        type === "error"
          ? "border-danger bg-surface text-danger"
          : type === "info"
          ? "border-border bg-surface text-text"
          : "border-accent bg-surface text-accent"
      }`}
    >
      <span>
        {type === "error" ? "⚠" : type === "info" ? "ℹ" : "✓"}
      </span>
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 200);
        }}
        className="ml-2 text-muted hover:text-text"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
