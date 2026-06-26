export interface Dimension {
  name: string;
  group: string;
}

export const allDimensions: Dimension[] = [
  { name: "差合键", group: "立回端" },
  { name: "先置键", group: "立回端" },
  { name: "安全复合", group: "立回端" },
  { name: "特殊取消", group: "立回端" },
  { name: "绿冲性能", group: "进攻端" },
  { name: "投Loop", group: "进攻端" },
  { name: "反截绿冲", group: "进攻端" },
  { name: "搬运能力", group: "进攻端" },
  { name: "确反伤害", group: "伤害端" },
  { name: "资源伤害转化率", group: "伤害端" },
  { name: "升龙判定", group: "防守端" },
  { name: "SA发生速度", group: "防守端" },
  { name: "无敌帧时长", group: "防守端" },
  { name: "穿波性能", group: "防守端" },
  { name: "确认范围", group: "防守端" },
];
