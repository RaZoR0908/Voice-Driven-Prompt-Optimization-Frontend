import { Mic, Square } from "lucide-react";

export default function MicButton({ isRecording, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-24 w-24 items-center justify-center rounded-full border-2 border-pink bg-surface-2 text-pink shadow-[0_0_20px_rgba(255,45,120,0.35)] transition-transform duration-300 hover:scale-105 ${
        isRecording ? "animate-pulse animate-pulse_glow" : ""
      }`}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? <Square size={32} /> : <Mic size={32} />}
    </button>
  );
}
