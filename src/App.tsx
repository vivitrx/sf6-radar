import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { RadarChart } from "./components/RadarChart";

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
    <div>
      <div>
        <span>角色名：</span>
        <input
          type="text"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
        />
        <span>满分：</span>
        <input
          type="number"
          value={maxScore}
          min={1}
          max={10}
          onChange={handleMaxScoreChange}
        />
      </div>
      <button onClick={handleExport}>导出图片</button>
      <RadarChart
        scores={scores}
        maxScore={maxScore}
        onScoreChange={handleScoreChange}
        chartRef={chartRef}
      />
    </div>
  );
}
