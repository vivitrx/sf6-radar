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
      <div className="explanation">
        <h2>街霸6角色评价四端口</h2>

        <h3>1. 立回端（对应"差合与牵制"能力）</h3>
        <p>角色在地面中立阶段获取优势的能力，核心看拳脚素质。</p>
        <table>
          <thead><tr><th>子维度</th><th>具体指标</th></tr></thead>
          <tbody>
            <tr><td>差合键</td><td>有没有好用的差合拳脚（如2MP、2MK的长度和发生）</td></tr>
            <tr><td>先置键</td><td>有没有好用的先置/拦截拳脚（如5HP、5MK的判定范围）</td></tr>
            <tr><td>安全复合</td><td>常用拳脚能否做到安全确认（打中可连、被防无责）</td></tr>
            <tr><td>特殊取消</td><td>拳脚能否取消接波动/突进技（如肯的拳脚复合迅雷）</td></tr>
          </tbody>
        </table>

        <h3>2. 进攻端（对应"压制与起攻"能力）</h3>
        <p>角色拿到先手或把对手放倒后的持续压制能力。</p>
        <table>
          <thead><tr><th>子维度</th><th>具体指标</th></tr></thead>
          <tbody>
            <tr><td>绿冲性能</td><td>有没有2MK绿冲取消、快绿冲（绿冲发生帧数）</td></tr>
            <tr><td>投Loop</td><td>有没有loop投，能持续制造起身二择</td></tr>
            <tr><td>反截绿冲</td><td>对手想截你的绿冲时，你有没有办法反制</td></tr>
            <tr><td>搬运能力</td><td>连段搬运距离，能把对手从版中推到版边的能力</td></tr>
          </tbody>
        </table>

        <h3>3. 伤害端（对应"确反与输出"能力）</h3>
        <p>角色把机会转化为伤害的效率。</p>
        <table>
          <thead><tr><th>子维度</th><th>具体指标</th></tr></thead>
          <tbody>
            <tr><td>确反伤害</td><td>抓到大破绽后的确反连段伤害上限</td></tr>
            <tr><td>资源伤害转化率</td><td>同等资源（一气/三气/OD槽）下的伤害性价比</td></tr>
          </tbody>
        </table>

        <h3>4. 防守端（对应"凹与抗压"能力）</h3>
        <p>角色在被压制或劣势局面下的逆转/逃脱能力。</p>
        <table>
          <thead><tr><th>子维度</th><th>具体指标</th></tr></thead>
          <tbody>
            <tr><td>升龙判定</td><td>有没有升龙和OD升龙，升龙的横向判定如何</td></tr>
            <tr><td>SA发生速度</td><td>SA最速发生帧（肯SA1 7f vs 英格丽德SA3 20f）</td></tr>
            <tr><td>无敌帧时长</td><td>SA/OD技的无敌帧长短</td></tr>
            <tr><td>穿波性能</td><td>凹招是否具备穿波属性</td></tr>
            <tr><td>确认范围</td><td>是全板确认还是半板确认（影响连段和凹招的容错率）</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
