/** 快捷键值的格式 */
export type HotKeyValue = `keyboard:${string}` | `mouse:${string}`;

/** 扩展配置 */
export interface NomNomConfig {
  /** Tab Pool 大小，每批打开的标签数 */
  tabPoolCount: number;
  /** 下一个链接的快捷键 */
  nextLinkHotKey: HotKeyValue;
  /** 限制打开的链接数量，0 表示不限制 */
  limitOpenLinkCount: number;
}

/** 配置的部分更新 */
export type ConfigUpdate = Partial<NomNomConfig>;

/** 默认配置 */
export const DEFAULT_CONFIG: Readonly<NomNomConfig> = {
  tabPoolCount: 3,
  nextLinkHotKey: 'keyboard:Shift + ArrowRight',
  limitOpenLinkCount: 0,
} as const;
