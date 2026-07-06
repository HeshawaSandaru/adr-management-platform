import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { AdrService } from "../services/adr.service";

// ----------------------------------------------------------------------------
// Styling constants
// ----------------------------------------------------------------------------

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Draft: { bg: "#f9fafb", border: "#d1d5db", text: "#374151", dot: "#9ca3af" },
  Proposed: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", dot: "#3b82f6" },
  Accepted: { bg: "#f0fdf4", border: "#86efac", text: "#15803d", dot: "#22c55e" },
  Rejected: { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c", dot: "#ef4444" },
  Archived: { bg: "#faf5ff", border: "#d8b4fe", text: "#7e22ce", dot: "#a855f7" },
};
const NODE_WIDTH = 220;
const NODE_HEIGHT = 68;

// ----------------------------------------------------------------------------
// Custom node
// ----------------------------------------------------------------------------

interface ADRNodeData {
  title: string;
  status: string;
  dimmed: boolean;
  highlighted: boolean;
}

function ADRNode({ data }: { data: ADRNodeData }) {
  const colors = STATUS_COLORS[data.status] || STATUS_COLORS.Draft;

  return (
    <div
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        backgroundColor: colors.bg,
        border: `2px solid ${data.highlighted ? colors.dot : colors.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: data.highlighted
          ? `0 0 0 3px ${colors.dot}33, 0 4px 10px rgba(0,0,0,0.08)`
          : "0 1px 3px rgba(0,0,0,0.06)",
        opacity: data.dimmed ? 0.35 : 1,
        transition: "opacity 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />

      <div
        style={{
          fontWeight: 600,
          fontSize: 13.5,
          color: colors.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}
        title={data.title}
      >
        {data.title}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: colors.dot,
            display: "inline-block",
          }}
        />
        <span style={{ fontSize: 11.5, color: colors.text, opacity: 0.85 }}>
          {data.status}
        </span>
      </div>
    </div>
  );
}

const handleStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  background: "#9ca3af",
  border: "none",
};

const nodeTypes = { adrNode: ADRNode };

// ----------------------------------------------------------------------------
// Main page (wrapped in provider below)
// ----------------------------------------------------------------------------

function DependencyGraphInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ADRNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<"TB" | "LR">("TB");
  const [search, setSearch] = useState("");
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [fitViewAttempted, setFitViewAttempted] = useState(false);

  const rawNodesRef = useRef<Node[]>([]);
  const rawEdgesRef = useRef<Edge[]>([]);

  const navigate = useNavigate();
  const { fitView } = useReactFlow();

  // ---- Load graph data ----
  useEffect(() => {
    setLoading(true);
    setError("");
    setIsLayoutReady(false);
    setFitViewAttempted(false);

    AdrService.getGraph()
      .then((res) => {
        const flowNodes: Node[] = res.nodes.map((node) => ({
          id: node.id,
          type: "adrNode",
          position: { x: 0, y: 0 },
          data: {
            title: node.title,
            status: node.status,
            dimmed: false,
            highlighted: false,
          },
        }));

        const flowEdges: Edge[] = res.edges.map((edge, index) => ({
          id: `edge-${index}`,
          source: edge.from,
          target: edge.to,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#9ca3af", width: 18, height: 18 },
          style: { stroke: "#d1d5db", strokeWidth: 1.75 },
        }));

        rawNodesRef.current = flowNodes;
        rawEdgesRef.current = flowEdges;

        setNodes(flowNodes);
        setEdges(flowEdges);
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || "Failed to load dependency graph");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Dagre layout ----
  const applyLayout = useCallback(
    async (dir: "TB" | "LR", baseNodes: Node[], baseEdges: Edge[]) => {
      if (baseNodes.length === 0) return baseNodes;

      const dagre = await import("dagre");
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({
        rankdir: dir,
        nodesep: 50,
        ranksep: 90,
        align: "UL",
      });

      baseNodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
      baseEdges.forEach((e) => g.setEdge(e.source, e.target));

      dagre.layout(g);

      return baseNodes.map((n) => {
        const pos = g.node(n.id);
        return {
          ...n,
          position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
        };
      });
    },
    []
  );

  const onLayout = useCallback(
    async (dir: "TB" | "LR") => {
      const laidOut = await applyLayout(dir, rawNodesRef.current, rawEdgesRef.current);
      rawNodesRef.current = laidOut;
      setNodes(applyHighlight(laidOut, activeNodeId, search));
      setDirection(dir);
      setIsLayoutReady(true);
      setFitViewAttempted(false);
    },
    [applyLayout, activeNodeId, search, setNodes]
  );

  // Run layout once data has arrived
  useEffect(() => {
    if (rawNodesRef.current.length > 0 && !loading) {
      onLayout("TB");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ---- Fit view after nodes are rendered ----
  useEffect(() => {
    if (isLayoutReady && nodes.length > 0 && !fitViewAttempted) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            fitView({ 
              padding: 0.2, 
              duration: 300,
              includeHiddenNodes: true 
            });
            setFitViewAttempted(true);
          }, 100);
        });
      });
    }
  }, [isLayoutReady, nodes, fitView, fitViewAttempted]);

  // ---- Highlighting helpers ----
  function applyHighlight(baseNodes: Node[], focusId: string | null, query: string) {
    const q = query.trim().toLowerCase();

    const matchedIds = new Set(
      q
        ? baseNodes
            .filter((n) => (n.data as ADRNodeData).title.toLowerCase().includes(q))
            .map((n) => n.id)
        : []
    );

    const connectedIds = new Set<string>();
    if (focusId) {
      connectedIds.add(focusId);
      rawEdgesRef.current.forEach((e) => {
        if (e.source === focusId) connectedIds.add(e.target);
        if (e.target === focusId) connectedIds.add(e.source);
      });
    }

    return baseNodes.map((n) => {
      const isFocused = focusId ? connectedIds.has(n.id) : true;
      const isSearchMatch = q ? matchedIds.has(n.id) : true;
      const shouldDim = !isFocused || !isSearchMatch;

      return {
        ...n,
        data: {
          ...n.data,
          dimmed: shouldDim,
          highlighted: focusId === n.id,
        },
      };
    });
  }

  // ---- Detect and highlight circular dependencies in edges ----
  const getCircularDependencyEdges = useCallback((edges: Edge[]) => {
    const circularPairs = new Set<string>();
    const edgeMap = new Map<string, Set<string>>();
    
    // Build adjacency list
    edges.forEach(edge => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, new Set());
      }
      edgeMap.get(edge.source)!.add(edge.target);
    });

    // Find mutual dependencies (A->B and B->A)
    for (const [source, targets] of edgeMap) {
      for (const target of targets) {
        if (edgeMap.has(target) && edgeMap.get(target)!.has(source)) {
          // Found circular dependency
          const pair = [source, target].sort().join('-');
          circularPairs.add(pair);
        }
      }
    }

    return circularPairs;
  }, []);

  useEffect(() => {
    if (!isLayoutReady) return;
    
    const circularPairs = getCircularDependencyEdges(rawEdgesRef.current);
    
    setNodes((prev) => applyHighlight(prev, activeNodeId, search));
    setEdges((prev) =>
      prev.map((e) => {
        const connected = activeNodeId && (e.source === activeNodeId || e.target === activeNodeId);
        const pair = [e.source, e.target].sort().join('-');
        const isCircular = circularPairs.has(pair);
        
        return {
          ...e,
          animated: !!connected || isCircular,
          style: {
            stroke: isCircular ? "#ef4444" : connected ? "#3b82f6" : "#d1d5db",
            strokeWidth: isCircular ? 2.5 : connected ? 2.25 : 1.75,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isCircular ? "#ef4444" : connected ? "#3b82f6" : "#9ca3af",
            width: isCircular ? 20 : 18,
            height: isCircular ? 20 : 18,
          },
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNodeId, search, isLayoutReady]);

  // ---- Node interactions ----
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setActiveNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      navigate(`/adrs/${node.id}`);
    },
    [navigate]
  );

  const onPaneClick = useCallback(() => setActiveNodeId(null), []);

  // ---- Go back ----
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // ---- Stats ----
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    rawNodesRef.current.forEach((n) => {
      const status = (n.data as ADRNodeData).status;
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [nodes.length]);

  // Count circular dependencies
  const circularCount = useMemo(() => {
    const circularPairs = getCircularDependencyEdges(rawEdgesRef.current);
    return circularPairs.size;
  }, [edges, getCircularDependencyEdges]);

  // ---- Render states ----
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">Loading dependency graph…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="font-medium">No ADRs to display yet</p>
        <p className="text-sm mt-1">Create an ADR and link dependencies to see the graph.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={goBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Go back"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div>
            <h2 className="text-xl font-bold">Dependency Graph</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Click a node to trace its connections. Double-click to open the ADR.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Legend + stats */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: colors.dot }}
            />
            <span className="text-gray-600">{status}</span>
            <span className="text-gray-400">({stats[status] || 0})</span>
          </div>
        ))}
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">
          {rawNodesRef.current.length} ADRs · {rawEdgesRef.current.length} dependencies
        </span>
        {circularCount > 0 && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-red-500 font-medium flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
              ⚠️ {circularCount} circular {circularCount === 1 ? 'dependency' : 'dependencies'}
            </span>
          </>
        )}
      </div>

      {/* Graph canvas */}
      <div
        className="border rounded-lg overflow-hidden bg-white"
        style={{ height: "72vh", width: "100%" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          minZoom={0.1}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} color="#e5e7eb" gap={18} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => {
              const status = (node.data as ADRNodeData)?.status || "Draft";
              return STATUS_COLORS[status]?.dot || "#9ca3af";
            }}
            maskColor="rgba(0,0,0,0.08)"
            style={{ border: "1px solid #e5e7eb" }}
          />

          <Panel position="top-right" className="flex gap-2">
            <button
              onClick={() => onLayout("TB")}
              className={`px-3 py-1.5 text-sm border rounded-md shadow-sm transition-colors ${
                direction === "TB"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-50 border-gray-300"
              }`}
            >
              Vertical
            </button>
            <button
              onClick={() => onLayout("LR")}
              className={`px-3 py-1.5 text-sm border rounded-md shadow-sm transition-colors ${
                direction === "LR"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-50 border-gray-300"
              }`}
            >
              Horizontal
            </button>
            <button
              onClick={() => {
                setFitViewAttempted(false);
                setTimeout(() => {
                  fitView({ padding: 0.2, duration: 300 });
                  setFitViewAttempted(true);
                }, 50);
              }}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Fit View
            </button>
          </Panel>

          {activeNodeId && (
            <Panel position="bottom-left">
              <div className="bg-white border border-gray-200 rounded-md shadow-sm px-3 py-2 text-xs text-gray-600">
                Showing connections for{" "}
                <span className="font-medium text-gray-800">
                  {(nodes.find((n) => n.id === activeNodeId)?.data as ADRNodeData)?.title}
                </span>
                <button
                  onClick={() => setActiveNodeId(null)}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Clear
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

// ReactFlow's useReactFlow() hook requires a ReactFlowProvider ancestor —
// wrapping here keeps that detail out of the routing layer.
export default function DependencyGraphPage() {
  return (
    <ReactFlowProvider>
      <DependencyGraphInner />
    </ReactFlowProvider>
  );
}