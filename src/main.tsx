import { createRoot } from "react-dom/client";
import { App } from "./App";

// 1. 找到 HTML 里 id="root" 的 div
const rootDom = document.getElementById("root")!;

// 2. 告诉 React："这个 div 归你管了"
// 3. 把 <App /> 组件塞进去
createRoot(rootDom).render(<App />);
