import { useEffect, useRef } from "react";

const domainToColor = {
  marketing: "#ff2d78",
  code: "#4dc8ff",
  writing: "#7b61ff",
};

export default function MemoryGraph({ graphData, loading }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (loading || !containerRef.current || !graphData || !window.vis) {
      return;
    }

    const nodes = (graphData.nodes || []).map((node) => ({
      id: node.id,
      label: node.label ? String(node.label).slice(0, 30) : "",
      value: 20 + (node.useCount || 1) * 3,
      color: domainToColor[(node.domain || "").toLowerCase()] || "#6b6b80",
      font: { color: "#e8e8f0", face: "Space Mono", size: 14, vadjust: -16 },
      shape: "dot",
    }));

    const edges = (graphData.edges || []).map((edge, index) => ({
      id: `${edge.from}-${edge.to}-${index}`,
      from: edge.from,
      to: edge.to,
      label: edge.edgeType,
      value: edge.score || 1,
      color: { color: "#2a2a38" },
      font: { color: "#6b6b80", size: 11, face: "Space Mono" },
    }));

    const network = new window.vis.Network(
      containerRef.current,
      { nodes, edges },
      {
        layout: { improvedLayout: true },
        physics: {
          enabled: true,
          stabilization: { iterations: 200, fit: true },
          barnesHut: {
            gravitationalConstant: -3000,
            springLength: 200,
            springConstant: 0.04,
            damping: 0.09,
          },
        },
        nodes: {
          shape: "dot",
          scaling: { min: 20, max: 44 },
          font: { color: "#e8e8f0", face: "Space Mono", size: 14, vadjust: -16 },
          margin: 14,
        },
        edges: {
          arrows: { to: { enabled: true, scaleFactor: 0.7 } },
          smooth: { type: "dynamic" },
          font: { color: "#6b6b80", size: 11, face: "Space Mono", align: "middle" },
        },
        interaction: { hover: true, tooltipDelay: 120 },
      }
    );

    return () => network.destroy();
  }, [graphData, loading]);

  if (loading) {
    return (
      <div className="h-72 animate-pulse rounded-xl border border-border bg-surface-2 p-4 text-sm text-muted">
        Loading memory graph...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[400px] rounded-xl border border-pink/20 bg-[#0a0a0f]"
      aria-label="Memory graph"
    />
  );
}
