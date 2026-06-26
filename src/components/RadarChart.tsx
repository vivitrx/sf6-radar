import { useState, useMemo } from "react";
import { allDimensions } from "../data/dimensions";

interface Props {
  scores: number[];
  maxScore: number;
  characterName: string;
  onScoreChange: (index: number, newScore: number) => void;
  chartRef: React.RefObject<SVGSVGElement | null>;
}

const n = allDimensions.length;
const r = 240; // 雷达图半径（固定，不随满分变化）
const SVG_W = 982;
const SVG_H = 843;
const cx = SVG_W / 2;
const cy = SVG_H / 2;

export function RadarChart({ scores, maxScore, characterName, onScoreChange, chartRef }: Props) {

  const angles = useMemo(
    () =>
      Array.from(
        { length: n },
        (_, i) => (2 * Math.PI * i) / n - Math.PI / 2,
      ),
    [],
  );

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleMouseDown = (index: number) => {
    setDragIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragIndex === null) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * SVG_W;
    const my = ((e.clientY - rect.top) / rect.height) * SVG_H;
    const dx = mx - cx;
    const dy = my - cy;
    let dist = Math.sqrt(dx * dx + dy * dy);
    dist = Math.max(0, Math.min(r, dist));
    const newScore = Math.round((dist / r) * maxScore);
    onScoreChange(dragIndex, newScore);
  };

  const handleMouseUp = () => {
    setDragIndex(null);
  };

  const points = scores.map((score, i) => {
    const radius = (score / maxScore) * r;
    const x = cx + radius * Math.cos(angles[i]);
    const y = cy + radius * Math.sin(angles[i]);
    return { x, y };
  });

  return (
    <svg
      ref={chartRef}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{}}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 标题 */}
      <text
        x={SVG_W / 2}
        y={40}
        textAnchor="middle"
        fontSize={22}
        fontWeight="bold"
        fill="#212121"
      >
        {characterName} 角色性能雷达图
      </text>

      {/* 四大端口数据色块 —— 用 scores 顶点拼接，非满扇形 */}
      {(() => {
        const subPolygons = [
          { name: "立回端", start: 0, end: 4, fill: "#fff9c4", stroke: "#fdd835" },
          { name: "进攻端", start: 4, end: 8, fill: "#ffcdd2", stroke: "#e57373" },
          { name: "伤害端", start: 8, end: 10, fill: "#ffe0b2", stroke: "#ff9800" },
          { name: "防守端", start: 10, end: 15, fill: "#bbdefb", stroke: "#42a5f5" },
        ];
        return subPolygons.map((sec) => {
          const pts: string[] = [];
          // 闭区间，用 scores 算出的真实顶点坐标
          for (let i = sec.start; i <= sec.end; i++) {
            const idx = i % n;
            pts.push(`${points[idx].x},${points[idx].y}`);
          }
          return (
            <polygon
              key={sec.name}
              points={`${cx},${cy} ${pts.join(" ")}`}
              fill={sec.fill}
              fillOpacity={0.6}
              stroke={sec.stroke}
              strokeWidth={1.5}
            />
          );
        });
      })()}

      {/* 背景网格：同心圆数量 = maxScore（上限 10） */}
      {Array.from({ length: Math.min(maxScore, 10) }, (_, i) => {
        const scale = (i + 1) / Math.min(maxScore, 10);
        const val = Math.round(maxScore * scale);
        return (
          <g key={scale}>
            <circle
              cx={cx}
              cy={cy}
              r={r * scale}
              fill="none"
              stroke="#cccccc"
              strokeWidth={0.5}
            />
            <text
              x={cx + r * scale * Math.cos(angles[0])}
              y={cy + r * scale * Math.sin(angles[0]) - 6}
              textAnchor="middle"
              fontSize={9}
              fill="#999"
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* 从圆心到每个顶点的轴线 */}
      {angles.map((angle, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + r * Math.cos(angle)}
          y2={cy + r * Math.sin(angle)}
          stroke="#e0e0e0"
          strokeWidth={0.5}
        />
      ))}

      {/* 虚线分隔 —— 延伸到外圈，供端口标签定位用 */}
      {[0, 4, 8, 10].map((idx) => (
        <line
          key={`split-${idx}`}
          x1={cx}
          y1={cy}
          x2={cx + r * Math.cos(angles[idx])}
          y2={cy + r * Math.sin(angles[idx])}
          stroke="#aaa"
          strokeWidth={1}
          strokeDasharray="6,4"
        />
      ))}

      {/* 15 个可拖拽的顶点圆 */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={6}
          fill="#ff3a3a"
          stroke="white"
          strokeWidth={2}
          style={{ cursor: "grab" }}
          onMouseDown={() => handleMouseDown(i)}
        />
      ))}

      {/* 维度标签 */}
      {allDimensions.map((dim, i) => {
        const labelR = r + 18;
        const lx = cx + labelR * Math.cos(angles[i]);
        const ly = cy + labelR * Math.sin(angles[i]);
        const anchor =
          Math.cos(angles[i]) > 0.05
            ? "start"
            : Math.cos(angles[i]) < -0.05
              ? "end"
              : "middle";
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={12}
            fill="#333"
          >
            {dim.name}: {scores[i]}
          </text>
        );
      })}

      {/* 四大端口名称 —— 弦垂线法，四标签同距圆心 */}
      {(() => {
        const portDefs: { name: string; start: number; end: number; color: string }[] = [
          { name: "立回端", start: 0, end: 4, color: "#f9a825" },
          { name: "进攻端", start: 4, end: 8, color: "#c62828" },
          { name: "伤害端", start: 8, end: 10, color: "#e65100" },
          { name: "防守端", start: 10, end: 15, color: "#1565c0" },
        ];
        const labelDist = 1.65 * r; // 四个标签统一距圆心 1.65 倍半径
        return portDefs.map((port) => {
          const idx1 = port.start;
          const idx2 = port.end % n; // 防守端 end=15 → 0
          const x1 = cx + r * Math.cos(angles[idx1]);
          const y1 = cy + r * Math.sin(angles[idx1]);
          const x2 = cx + r * Math.cos(angles[idx2]);
          const y2 = cy + r * Math.sin(angles[idx2]);
          // 弦中点
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          // 远离圆心方向
          const outDx = mx - cx;
          const outDy = my - cy;
          const midDist = Math.sqrt(outDx * outDx + outDy * outDy);
          const ux = outDx / midDist;
          const uy = outDy / midDist;
          // 从弦中点沿向外方向延伸到 labelDist
          const lx = mx + (labelDist - midDist) * ux;
          const ly = my + (labelDist - midDist) * uy;
          return (
            <text
              key={port.name}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={15}
              fontWeight="bold"
              fill={port.color}
            >
              {port.name}
            </text>
          );
        });
      })()}
    </svg>
  );
}
