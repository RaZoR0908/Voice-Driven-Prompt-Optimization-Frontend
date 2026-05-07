import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { getHistory } from "../api";
import HistoryList from "../components/HistoryList";
import { getOrCreateSessionId } from "../lib/session";

export default function History() {
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getHistory(sessionId);
        setHistory([...(response.data || [])].reverse());
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Something went wrong. Please retry.";
        setToast(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 md:px-0">
      <h1 className="font-mono text-xl text-pink md:text-2xl">
        SESSION HISTORY
      </h1>
      <p className="mt-2 text-sm text-muted">
        Chat interaction and decision logs for session{' '}
        <span className="font-mono text-pink-light">{sessionId}</span>
      </p>

      <div className="mt-6">
        {loading && (
          <div className="rounded-2xl border border-border bg-surface/70 p-6 text-center backdrop-blur-md">
            <LoaderCircle className="mx-auto animate-spin text-pink" />
            <p className="mt-3 text-sm text-muted">Loading history...</p>
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface/70 p-6 text-sm text-muted">
            No history yet. Start a session on the home page.
          </div>
        )}

        {!loading && history.length > 0 && <HistoryList items={history} />}
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-[1100] max-w-sm rounded-lg border border-danger/50 bg-danger px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </section>
  );
}
