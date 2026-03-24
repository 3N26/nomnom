import type { HotKeyValue } from './config';

/** 快捷键解析结果 */
export interface ParsedHotKey {
  /** 显示用的组合键文本 */
  displayText: string;
  /** 存储用的值 */
  value: HotKeyValue;
}

/** 键盘事件快捷键信息 */
export interface KeyboardHotKeyInfo {
  type: 'keyboard';
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  key: string;
}

/** 鼠标事件快捷键信息 */
export interface MouseHotKeyInfo {
  type: 'mouse';
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  button: number;
}

export type HotKeyInfo = KeyboardHotKeyInfo | MouseHotKeyInfo;
