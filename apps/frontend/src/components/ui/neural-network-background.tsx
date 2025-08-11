"use client";

import React, { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
}

interface NeuralNetworkBackgroundProps {
  className?: string;
  nodeCount?: number;
  maxConnections?: number;
  animationSpeed?: number;
  nodeOpacity?: number;
  lineOpacity?: number;
}

const NeuralNetworkBackground: React.FC<NeuralNetworkBackgroundProps> = ({
  className = "",
  nodeCount = 80,
  maxConnections = 3,
  animationSpeed = 0.3,
  nodeOpacity = 0.6,
  lineOpacity = 0.2
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // Tính toán khoảng cách giữa hai node
  const getDistance = useCallback((node1: Node, node2: Node): number => {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Khởi tạo nodes với phân bố đều và coverage hoàn toàn
  const initializeNodes = useCallback((width: number, height: number) => {
    const nodes: Node[] = [];

    // Tính toán grid để phân bố đều với coverage tối đa
    const aspectRatio = width / height;

    // Đảm bảo coverage hoàn toàn bằng cách thêm nodes ở edges
    const edgeNodes: Node[] = [];

    // Thêm nodes ở 4 góc
    edgeNodes.push(
      { x: 10, y: 10, vx: animationSpeed * 0.5, vy: animationSpeed * 0.5, connections: [] },
      { x: width - 10, y: 10, vx: -animationSpeed * 0.5, vy: animationSpeed * 0.5, connections: [] },
      { x: 10, y: height - 10, vx: animationSpeed * 0.5, vy: -animationSpeed * 0.5, connections: [] },
      { x: width - 10, y: height - 10, vx: -animationSpeed * 0.5, vy: -animationSpeed * 0.5, connections: [] }
    );

    // Thêm nodes dọc theo edges
    const edgeSpacing = Math.min(width, height) / 8;
    for (let i = edgeSpacing; i < width - edgeSpacing; i += edgeSpacing) {
      edgeNodes.push(
        { x: i, y: 5, vx: (Math.random() - 0.5) * animationSpeed, vy: animationSpeed * 0.3, connections: [] },
        { x: i, y: height - 5, vx: (Math.random() - 0.5) * animationSpeed, vy: -animationSpeed * 0.3, connections: [] }
      );
    }
    for (let i = edgeSpacing; i < height - edgeSpacing; i += edgeSpacing) {
      edgeNodes.push(
        { x: 5, y: i, vx: animationSpeed * 0.3, vy: (Math.random() - 0.5) * animationSpeed, connections: [] },
        { x: width - 5, y: i, vx: -animationSpeed * 0.3, vy: (Math.random() - 0.5) * animationSpeed, connections: [] }
      );
    }

    // Tạo nodes chính trong grid với mật độ cao hơn ở trung tâm
    const remainingNodes = nodeCount - edgeNodes.length;

    // Tạo grid dày đặc hơn
    const denseCols = Math.ceil(Math.sqrt(remainingNodes * aspectRatio * 1.2)); // Tăng mật độ 20%
    const denseRows = Math.ceil(remainingNodes / denseCols);
    const denseCellWidth = width / denseCols;
    const denseCellHeight = height / denseRows;

    for (let i = 0; i < remainingNodes; i++) {
      const col = i % denseCols;
      const row = Math.floor(i / denseCols);

      // Vị trí cơ bản trong grid dày đặc
      const baseX = (col + 0.5) * denseCellWidth;
      const baseY = (row + 0.5) * denseCellHeight;

      // Giảm random offset để nodes gần nhau hơn, tăng mật độ
      const offsetX = (Math.random() - 0.5) * denseCellWidth * 0.3; // Giảm từ 0.4 xuống 0.3
      const offsetY = (Math.random() - 0.5) * denseCellHeight * 0.3;

      nodes.push({
        x: Math.max(25, Math.min(width - 25, baseX + offsetX)), // Giảm padding để tận dụng không gian
        y: Math.max(25, Math.min(height - 25, baseY + offsetY)),
        vx: (Math.random() - 0.5) * animationSpeed,
        vy: (Math.random() - 0.5) * animationSpeed,
        connections: []
      });
    }

    // Thêm extra nodes ở vùng trung tâm để tăng mật độ
    const centerNodes = Math.floor(nodeCount * 0.15); // 15% nodes bổ sung ở trung tâm
    const centerX = width / 2;
    const centerY = height / 2;
    const centerRadius = Math.min(width, height) * 0.3;

    for (let i = 0; i < centerNodes; i++) {
      const angle = (i / centerNodes) * Math.PI * 2;
      const radius = Math.random() * centerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      nodes.push({
        x: Math.max(25, Math.min(width - 25, x)),
        y: Math.max(25, Math.min(height - 25, y)),
        vx: (Math.random() - 0.5) * animationSpeed * 0.8,
        vy: (Math.random() - 0.5) * animationSpeed * 0.8,
        connections: []
      });
    }

    // Kết hợp edge nodes và main nodes
    const allNodes = [...edgeNodes, ...nodes];

    // Tạo connections dựa trên khoảng cách với thuật toán tối ưu
    const maxDistance = Math.min(width, height) * 0.18; // Tăng từ 0.15 lên 0.18 để có nhiều connections hơn

    allNodes.forEach((node, index) => {
      const distances: { index: number; distance: number }[] = [];

      allNodes.forEach((otherNode, otherIndex) => {
        if (index !== otherIndex) {
          const distance = getDistance(node, otherNode);
          if (distance <= maxDistance) { // Chỉ kết nối nodes gần nhau
            distances.push({
              index: otherIndex,
              distance
            });
          }
        }
      });

      // Sắp xếp theo khoảng cách và chọn những node gần nhất
      distances.sort((a, b) => a.distance - b.distance);
      node.connections = distances
        .slice(0, maxConnections)
        .map(d => d.index);
    });

    return allNodes;
  }, [nodeCount, maxConnections, animationSpeed, getDistance]);

  // Cập nhật vị trí nodes
  const updateNodes = useCallback((nodes: Node[], width: number, height: number) => {
    nodes.forEach(node => {
      // Cập nhật vị trí
      node.x += node.vx;
      node.y += node.vy;
      
      // Bounce off edges với padding
      const padding = 20;
      if (node.x <= padding || node.x >= width - padding) {
        node.vx *= -1;
        node.x = Math.max(padding, Math.min(width - padding, node.x));
      }
      if (node.y <= padding || node.y >= height - padding) {
        node.vy *= -1;
        node.y = Math.max(padding, Math.min(height - padding, node.y));
      }
    });
  }, []);

  // Render neural network với tối ưu hiệu suất
  const render = useCallback((canvas: HTMLCanvasElement, nodes: Node[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Tối ưu rendering với batch operations
    ctx.save();

    // Draw connections first (behind nodes) với batch path
    ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
    ctx.lineWidth = 1.4; // Tăng từ 0.8px lên 1.4px để rõ ràng hơn
    ctx.lineCap = 'round';

    // Batch all line drawing operations
    ctx.beginPath();
    nodes.forEach((node, index) => {
      node.connections.forEach(connectionIndex => {
        if (connectionIndex > index && connectionIndex < nodes.length) { // Avoid drawing same line twice
          const connectedNode = nodes[connectionIndex];
          if (connectedNode) {
            // Thêm gradient effect cho lines dựa trên khoảng cách
            const distance = getDistance(node, connectedNode);
            const maxDist = Math.min(width, height) * 0.18; // Cập nhật theo maxDistance mới
            const opacity = lineOpacity * (1 - distance / maxDist * 0.7); // Giảm fade effect

            if (opacity > 0.08) { // Tăng threshold để có nhiều lines hiển thị hơn
              ctx.globalAlpha = opacity;
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(connectedNode.x, connectedNode.y);
            }
          }
        }
      });
    });
    ctx.stroke();

    // Draw nodes với batch operations
    ctx.globalAlpha = nodeOpacity;
    ctx.fillStyle = `rgba(255, 255, 255, 1)`;

    // Batch all node drawing operations
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }, [lineOpacity, nodeOpacity, getDistance]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { width, height } = dimensionsRef.current;
    updateNodes(nodesRef.current, width, height);
    render(canvas, nodesRef.current);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [updateNodes, render]);

  // Resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Set canvas size
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Scale context for high DPI
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    // Update dimensions
    dimensionsRef.current = { width, height };
    
    // Reinitialize nodes if dimensions changed significantly
    if (nodesRef.current.length === 0 || 
        Math.abs(dimensionsRef.current.width - width) > 100 ||
        Math.abs(dimensionsRef.current.height - height) > 100) {
      nodesRef.current = initializeNodes(width, height);
    }
  }, [initializeNodes]);

  // Initialize and cleanup
  useEffect(() => {
    handleResize();
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, animate]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
    </div>
  );
};

export default NeuralNetworkBackground;
