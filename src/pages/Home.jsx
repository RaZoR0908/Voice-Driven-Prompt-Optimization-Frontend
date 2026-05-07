import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { generatePrompt, submitVoice } from "../api";
import IntentCard from "../components/IntentCard";
import MicButton from "../components/MicButton";
import PromptOutput from "../components/PromptOutput";
import TextFallback from "../components/TextFallback";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { getOrCreateSessionId } from "../lib/session";

const STATES = {
  IDLE: "IDLE",
  RECORDING: "RECORDING",
  LOADING_STT: "LOADING_STT",
  REVIEW: "REVIEW",
  CONFIRM: "CONFIRM",
  LOADING_LLM: "LOADING_LLM",
  RESULT: "RESULT",
};

function parseIntent(intentJson) {
  if (!intentJson) {
    return {};
  }

  if (typeof intentJson === "string") {
    try {
      return JSON.parse(intentJson);
    } catch {
      return {};
    }
  }

  return intentJson;
}

function normalizeIntent(intent, transcript) {
  return {
    intent: intent.intent || "general_request",
    task: intent.task || transcript || "",
    domain: intent.domain || "other",
    constraints: Array.isArray(intent.constraints) ? intent.constraints : [],
    outputFormat: intent.outputFormat || intent.output_format || "paragraph",
    audience: intent.audience || "general",
  };
}

function confidenceMeta(score = 0) {
  if (score > 0.85) {
    return {
      text: "High Confidence ✓",
      className: "bg-success/20 text-success",
    };
  }

  if (score > 0.65) {
    return {
      text: "Medium Confidence",
      className: "bg-amber-400/20 text-amber-300",
    };
  }

  return {
    text: "Low Confidence — please retry",
    className: "bg-danger/20 text-danger",
  };
}

function normalizeLanguage(language) {
  const value = String(language || "").trim().toLowerCase();

  if (!value) {
    return "EN";
  }

  if (value.startsWith("hi") || value.includes("hindi")) {
    return "HI";
  }

  if (value.startsWith("en") || value.includes("english")) {
    return "EN";
  }

  return value.slice(0, 2).toUpperCase();
}

function hasNonLatinText(value) {
  return typeof value === "string" && /[^\x00-\x7F]/.test(value);
}

const languageLabel = {
  English: "English",
  Hindi: "Hindi",
  Hinglish: "Hinglish",
  en: "English",
  hi: "Hindi",
  hinglish: "Hinglish",
};

export default function Home() {
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [state, setState] = useState(STATES.IDLE);
  const [sourceMode, setSourceMode] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState("en");
  const [intent, setIntent] = useState(null);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState("");

  const { isRecording, audioBlob, duration, start, stop, clearAudio, reset } = useVoiceRecorder();

  const confidenceBadge = useMemo(() => confidenceMeta(confidence), [confidence]);
  const transcriptLanguage = normalizeLanguage(language);
  const transcriptNeedsTranslation = hasNonLatinText(transcript);

  const showToast = (message) => {
    if (!message) {
      return;
    }
    setToast(message);
  };

  const resetToIdle = (message = "") => {
    setState(STATES.IDLE);
    setSourceMode(null);
    setTranscript("");
    setConfidence(0);
    setLanguage("en");
    setIntent(null);
    setResult(null);
    clearAudio();
    reset();

    if (message) {
      showToast(message);
    }
  };

  const handleSttFailure = (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Something went wrong. Please retry.";
    resetToIdle(message);
  };

  const handleGenerateFailure = (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Something went wrong. Please retry.";
    showToast(message);
    setState(STATES.CONFIRM);
  };

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const processSttResponse = (data) => {
    const transcriptText = data?.transcript || "";
    const parsedIntent = parseIntent(data?.intentJson);

    setTranscript(transcriptText);
    setConfidence(Number(data?.confidence || 0));
    setLanguage(data?.language || "en");
    setIntent(normalizeIntent(parsedIntent, transcriptText));
    setState(STATES.REVIEW);
    setSourceMode(null);
    clearAudio();
  };

  const submitAudioForTranscription = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "voice-input.webm");
      formData.append("sessionId", sessionId);
      const response = await submitVoice(formData);
      processSttResponse(response.data);
    } catch (error) {
      handleSttFailure(error);
    }
  };

  const submitTextForTranscription = async (text) => {
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("sessionId", sessionId);
      const response = await submitVoice(formData);
      processSttResponse(response.data);
    } catch (error) {
      handleSttFailure(error);
    }
  };

  useEffect(() => {
    if (state === STATES.LOADING_STT && sourceMode === "audio" && audioBlob) {
      submitAudioForTranscription(audioBlob);
    }
  }, [audioBlob, sourceMode, state]);

  const handleMicClick = async () => {
    if (state === STATES.LOADING_STT || state === STATES.LOADING_LLM) {
      return;
    }

    if (!isRecording) {
      try {
        clearAudio();
        await start();
        setState(STATES.RECORDING);
      } catch (error) {
        handleSttFailure(error);
      }
      return;
    }

    stop();
    setSourceMode("audio");
    setState(STATES.LOADING_STT);
  };

  const handleTextSubmit = async (text) => {
    const inputText = text.trim();
    if (!inputText) {
      return;
    }

    setSourceMode("text");
    setState(STATES.LOADING_STT);

    try {
      const formData = new FormData();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      const destination = audioCtx.createMediaStreamDestination();
      source.connect(destination);
      source.start();

      const recorder = new MediaRecorder(destination.stream);
      const chunks = [];

      await new Promise((resolve, reject) => {
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        recorder.onerror = () => reject(new Error("Unable to prepare audio input."));
        recorder.onstop = resolve;
        recorder.start();
        window.setTimeout(() => recorder.stop(), 150);
      });

      source.stop();
      await audioCtx.close();

      const silentBlob = new Blob(chunks, { type: "audio/webm" });
      formData.append("audio", silentBlob, "silent.webm");
      formData.append("text", inputText);
      formData.append("sessionId", sessionId);

      const response = await submitVoice(formData);
      processSttResponse(response.data);
    } catch (error) {
      handleSttFailure(error);
    }
  };

  const handleContinueToConfirm = () => {
    if (confidence < 0.65) {
      showToast("Low confidence transcript. Please retry.");
      return;
    }

    setState(STATES.CONFIRM);
  };

  const handleConfirm = async (confirmedIntent) => {
    try {
      setIntent(confirmedIntent);
      setState(STATES.LOADING_LLM);
      const response = await generatePrompt({
        sessionId,
        intent: confirmedIntent.intent,
        task: confirmedIntent.task,
        domain: confirmedIntent.domain,
        constraints: confirmedIntent.constraints,
        output_format: confirmedIntent.outputFormat,
        audience: confirmedIntent.audience,
      }, sessionId);
      setResult(response.data);
      setState(STATES.RESULT);
    } catch (error) {
      handleGenerateFailure(error);
    }
  };

  const handleReject = () => {
    resetToIdle("Session reset. Start over.");
  };

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col px-4 py-10 md:px-0">
      {state === STATES.IDLE && (
        <div className="animate-fadeIn rounded-3xl border border-border bg-surface/70 px-5 py-8 text-center backdrop-blur-md md:px-8 md:py-10">
          <div className="flex justify-center">
            <MicButton isRecording={false} onClick={handleMicClick} />
          </div>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.25em] text-pink-light">
            Speak or type your prompt — we&apos;ll optimize it
          </p>
          <p className="mt-2 text-sm text-muted">
            Or use the text fallback below to keep the flow fast and deterministic.
          </p>
          <TextFallback onSubmit={handleTextSubmit} disabled={false} />
        </div>
      )}

      {state === STATES.RECORDING && (
        <div className="animate-fadeIn rounded-3xl border border-pink/20 bg-surface/70 px-5 py-8 text-center backdrop-blur-md md:px-8 md:py-10">
          <div className="flex justify-center">
            <MicButton isRecording onClick={handleMicClick} />
          </div>
          <p className="mt-5 animate-pulse font-mono text-xs uppercase tracking-[0.25em] text-pink-light">
            🔴 Recording... click to stop
          </p>
          <p className="mt-2 font-mono text-sm text-white/80">
            0:{String(duration).padStart(2, "0")}
          </p>
        </div>
      )}

      {state === STATES.LOADING_STT && (
        <div className="animate-fadeIn rounded-3xl border border-border bg-surface/70 px-5 py-8 text-center backdrop-blur-md md:px-8 md:py-10">
          <LoaderCircle className="mx-auto animate-spin text-pink" size={36} />
          <p className="mt-4 font-mono text-sm text-pink-light">
            Transcribing your voice...
          </p>
          <p className="mt-2 text-sm text-muted">
            Detecting language and extracting intent
          </p>
        </div>
      )}

      {state === STATES.REVIEW && intent && (
        <div className="space-y-4">
          <div className="animate-fadeIn rounded-2xl border border-border bg-surface/70 p-5 backdrop-blur-md md:p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-pink-light">
              WHAT WE HEARD
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              {transcript || "No transcript returned"}
            </p>
            {transcriptNeedsTranslation && (
              <div className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                ⚠ Translation error — backend did not normalize language
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className={`rounded-full px-3 py-1 ${confidenceBadge.className}`}>
                {confidenceBadge.text}
              </span>
              <span className="rounded-full bg-surface-2 px-3 py-1 text-cyan">
                Language: {languageLabel[language] || language}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {confidence < 0.65 ? (
                <button
                  type="button"
                  onClick={handleReject}
                  className="inline-flex items-center gap-2 rounded-lg border border-danger/40 px-4 py-2 text-sm text-danger hover:bg-danger/10"
                >
                  <RotateCcw size={16} />
                  Retry
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleContinueToConfirm}
                  className="inline-flex items-center gap-2 rounded-lg border border-pink/40 px-4 py-2 text-sm text-pink hover:bg-pink/10"
                >
                  <Sparkles size={16} />
                  Review Intent
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {state === STATES.CONFIRM && intent && (
        <IntentCard intent={intent} onConfirm={handleConfirm} onReject={handleReject} />
      )}

      {state === STATES.LOADING_LLM && (
        <div className="animate-fadeIn rounded-3xl border border-border bg-surface/70 px-5 py-8 text-center backdrop-blur-md md:px-8 md:py-10">
          <LoaderCircle className="mx-auto animate-spin text-pink" size={36} />
          <p className="mt-4 font-mono text-sm text-pink-light">
            Optimizing your prompt...
          </p>
          <p className="mt-2 text-sm text-muted">
            Applying CAVEMAN MODE — removing all unnecessary tokens
          </p>
        </div>
      )}

      {state === STATES.RESULT && result && (
        <PromptOutput result={result} onStartOver={() => resetToIdle()} />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-[1100] max-w-sm rounded-lg border border-danger/50 bg-danger px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </section>
  );
}