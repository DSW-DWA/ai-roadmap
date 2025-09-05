/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useMemo } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  type Node, type Edge, useNodesState, useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import type { Roadmap, Milestone } from '../types.ts';

type Props = {
  roadmap: Roadmap;
  onSelect?: (m: Milestone | null) => void;
  direction?: 'LR' | 'TB';
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

export default function RoadmapGraph({ roadmap, onSelect, direction = 'LR' }: Props) {
  const { nodes: initNodes, edges: initEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // root
    nodes.push({
      id: 'root',
      data: { label: roadmap.title },
      position: { x: 0, y: 0 },
      type: 'input',
      style: { width: nodeWidth, height: nodeHeight }
    });

    // milestones
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    roadmap.milestones.forEach((m, idx) => {
      nodes.push({
        id: m.id,
        data: { label: `${m.title}  (~${m.estimated_hours} ч)`, milestone: m },
        position: { x: 0, y: 0 },
        style: { width: nodeWidth, height: nodeHeight }
      });
      edges.push({ id: `e-root-${m.id}`, source: 'root', target: m.id, animated: false });
    });

    return { nodes, edges };
  }, [roadmap]);

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => layout(initNodes, initEdges, direction), [initNodes, initEdges, direction]
  );

  const [nodes, , onNodesChange] = useNodesState(layoutNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutEdges);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, n) => {
          const m = (n.data as any)?.milestone as Milestone | undefined;
          onSelect?.(m ?? null);
        }}
      >
        <MiniMap pannable zoomable />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
