import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { getMemoryCards, getMemoryGraph } from "../api";
import MemoryGraph from "../components/MemoryGraph";
import { getOrCreateSessionId } from "../lib/session";

const domainClassMap = {
  marketing: "bg-pink/20 text-pink",
  code: "bg-cyan/20 text-cyan",
  writing: "bg-violet/20 text-violet",
  data: "bg-orange-400/20 text-orange-300",
  research: "bg-yellow-400/20 text-yellow-200",
  other: "bg-surface-2 text-muted",
};

function domainBadgeClass(domain) {
  const value = String(domain || "other").toLowerCase();
  return domainClassMap[value] || domainClassMap.other;
}

export default function Memory() {
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [graphResponse, cardsResponse] = await Promise.all([
          getMemoryGraph(),
          getMemoryCards(sessionId),
        ]);
        setGraphData(graphResponse.data || { nodes: [], edges: [] });
        setCards(cardsResponse.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-0">
      <h1 className="font-mono text-xl text-pink md:text-2xl">
        MEMORY GRAPH
      </h1>
      <p className="mt-2 text-sm text-muted">
        Graph visualization, memory creation, memory update, and final memory output for session{' '}
        <span className="font-mono text-pink-light">{sessionId}</span>
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-pink/20 bg-[#0a0a0f] p-4 backdrop-blur-md">
        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
        ) : (
          <MemoryGraph graphData={graphData} loading={loading} />
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-mono text-sm uppercase tracking-widest text-pink-light">
          MEMORY CARDS
        </h2>

        {loading && (
          <div className="mt-4 rounded-xl border border-border bg-surface/70 p-6 text-center">
            <LoaderCircle className="mx-auto animate-spin text-pink" />
            <p className="mt-3 text-sm text-muted">Loading memory cards...</p>
          </div>
        )}

        {!loading && cards.length === 0 && !error && (
          <div className="mt-4 rounded-xl border border-border bg-surface/70 p-6 text-sm text-muted">
            No memories saved yet.
          </div>
        )}

        {!loading && cards.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <article
                key={card.id}
                className="group relative rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur-md transition hover:border-pink/40 hover:shadow-[0_0_22px_rgba(255,45,120,0.16)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs ${domainBadgeClass(card.domain)}`}>
                    {card.domain || "other"}
                  </span>
                  <span className="text-xs text-muted">Uses: {card.useCount ?? 0}</span>
                </div>
                <p className="mt-3 line-clamp-1 font-mono text-xs uppercase tracking-wider text-pink-light">
                  {card.task || "Untitled memory"}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-white/75">
                  {card.optimizedPrompt || "No optimized prompt available"}
                </p>
                <p className="mt-4 text-xs text-muted">
                  Updated: {new Date(card.updatedAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
