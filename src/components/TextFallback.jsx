import { Send } from "lucide-react";
import { useState } from "react";

export default function TextFallback({ onSubmit, disabled }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSubmit(trimmed);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex w-full items-center gap-2 rounded-xl border border-border bg-surface/80 p-2 backdrop-blur-md"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Or type in English, Hindi, or Hinglish..."
        className="w-full rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm text-white outline-none transition focus:border-pink"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-pink px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
