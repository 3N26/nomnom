/** 标签组进度状态 */
export interface TabGroupState {
  /** 待访问的 URL 列表 */
  urls: string[];
  /** 已访问数量 */
  visited: number;
  /** 总链接数量 */
  total: number;
  /** 当前组内的 tab IDs */
  tabIds: number[];
}

/** Storage Key 常量 */
export const StorageKey = {
  CONFIG: 'NOMNOM_CONFIG',
} as const;

/** 动态 Storage Key（标签组 ID） */
export type TabGroupStorageKey = `tabGroup:${number}`;

/** 创建标签组 Storage Key */
export function createTabGroupStorageKey(groupId: number): TabGroupStorageKey {
  return `tabGroup:${groupId}`;
}
