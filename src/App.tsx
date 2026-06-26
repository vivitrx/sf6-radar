import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { RadarChart } from "./components/RadarChart";
import "./App.css";

export function App() {
  const [characterName, setCharacterName] = useState("肯");
  const [maxScore, setMaxScore] = useState(10);
  const [scores, setScores] = useState<number[]>([
    9, 8, 9, 10, 10, 7, 8, 9, 8, 9, 9, 10, 6, 7, 8,
  ]);
  const chartRef = useRef<SVGSVGElement | null>(null);

  const handleMaxScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    if (newMax <= 0 || isNaN(newMax)) return;
    const capped = Math.min(newMax, 10);
    setScores((prev) => prev.map((s) => Math.round(s * (capped / maxScore))));
    setMaxScore(capped);
  };

  const handleScoreChange = (index: number, newScore: number) => {
    setScores((prev) => {
      const next = [...prev];
      next[index] = newScore;
      return next;
    });
  };

  const handleExport = useCallback(async () => {
    if (!chartRef.current) return;
    const dataUrl = await toPng(chartRef.current, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    });
    const link = document.createElement("a");
    link.download = `${characterName}_雷达图.png`;
    link.href = dataUrl;
    link.click();
  }, [characterName]);

  return (
    <div className="app-card">
      <div className="controls">
        <div className="control-group">
          <label>角色名</label>
          <input
            className="input-field input-field--name"
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
          />
        </div>
        <div className="control-group">
          <label>满分</label>
          <input
            className="input-field"
            type="number"
            value={maxScore}
            min={1}
            max={10}
            onChange={handleMaxScoreChange}
          />
        </div>
        <button className="btn btn-primary" onClick={handleExport}>
          导出图片
        </button>
      </div>
      <div className="hint">💡 先设定满分，再拖拽雷达图顶点进行评分</div>
      <div className="chart-wrapper">
        <RadarChart
          scores={scores}
          maxScore={maxScore}
          characterName={characterName}
          onScoreChange={handleScoreChange}
          chartRef={chartRef}
        />
      </div>
    </div>
  );
}
