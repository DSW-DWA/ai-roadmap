/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, MarkerType,
  type Node, type Edge, useNodesState, useEdgesState
} from 'reactflow';
import type { ReactFlowInstance } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import type { KnowledgeGraph, Concept } from '../types.ts';

type Props = {
  graph: KnowledgeGraph;
  onSelect?: (c: Concept | null) => void;
  direction?: 'LR' | 'TB';
  centerOnNode?: string | null;
};

const nodeWidth = 260;
const nodeHeight = 60;

function layout(nodes: Node[], edges: Edge[], direction: 'LR'|'TB' = 'LR') {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: 40, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(n => g.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach(e => g.setEdge(e.source, e.target));

  dagre.layout(g);

  const laidNodes = nodes.map(n => {
    const { x, y } = g.node(n.id);
    return {
      ...n,
      position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 }
    };
  });
  return { nodes: laidNodes, edges };
}

function buildGraph(graph: KnowledgeGraph) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const idFor = (title: string) => `c-${title}`;

  function addConceptTree(concepts: Concept[], parentId?: string) {
    for (const c of concepts) {
      const id = idFor(c.title);
      if (!nodes.find(n => n.id === id)) {
        nodes.push({
          id,
          data: { label: c.title, concept: c },
          position: { x: 0, y: 0 },
          style: { width: nodeWidth, height: nodeHeight }
        });
      }
      if (parentId) {
        const eid = `e-${parentId}-${id}`;
        if (!edges.find(e => e.id === eid)) {
          edges.push({ 
            id: eid, 
            source: parentId, 
            target: id, 
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#b1b1b7',
            },
            style: {
              strokeWidth: 2,
              stroke: '#b1b1b7',
            },
          });
        }
      }
      if (c.consist_of?.length) addConceptTree(c.consist_of, id);
      if (c.related?.length) {
        for (const r of c.related) {
          const rid = idFor(r);
          if (!nodes.find(n => n.id === rid)) {
            nodes.push({ id: rid, data: { label: r }, position: { x: 0, y: 0 }, style: { width: nodeWidth, height: nodeHeight } });
          }
          const reid = `rel-${id}-${rid}`;
          if (!edges.find(e => e.id === reid)) {
            edges.push({ 
              id: reid, 
              source: id, 
              target: rid, 
              animated: false,
              style: {
                strokeWidth: 1,
                stroke: '#b1b1b7',
                strokeDasharray: '5,5',
              },
            });
          }
        }
      }
    }
  }

  addConceptTree(graph.concepts);
  return { nodes, edges };
}

export default function RoadmapGraph({ graph, onSelect, direction = 'LR', centerOnNode }: Props) {
  const { nodes: initNodes, edges: initEdges } = useMemo(() => buildGraph(graph), [graph]);

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => layout(initNodes, initEdges, direction), [initNodes, initEdges, direction]
  );

  const [nodes, , onNodesChange] = useNodesState(layoutNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutEdges);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Center on specific node when centerOnNode changes
  useEffect(() => {
    if (centerOnNode && reactFlowInstance.current) {
      const nodeId = `c-${centerOnNode}`;
      reactFlowInstance.current.fitView({ 
        nodes: [{ id: nodeId }], 
        duration: 800,
        padding: 0.1 
      });
    }
  }, [centerOnNode]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, n) => {
          const c = (n.data as any)?.concept as Concept | undefined;
          onSelect?.(c ?? null);
        }}
      >
        <MiniMap pannable zoomable />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
