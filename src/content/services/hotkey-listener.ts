import { getConfig } from '@shared/services/config.service';
import { matchHotKey, parseStoredHotKey } from '@shared/utils/hotkey';
import type { HotKeyValue } from '@shared/types/config';

type HotKeyCallback = () => void;

let currentHotKey: HotKeyValue | null = null;
let callback: HotKeyCallback | null = null;

/**
 * 键盘事件处理
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (!currentHotKey || !callback) return;

  const info = parseStoredHotKey(currentHotKey);
  if (info?.type !== 'keyboard') return;

  if (matchHotKey(currentHotKey, event)) {
    event.preventDefault();
    callback();
  }
}

/**
 * 鼠标事件处理
 */
function handleMouseDown(event: MouseEvent): void {
  if (!currentHotKey || !callback) return;

  const info = parseStoredHotKey(currentHotKey);
  if (info?.type !== 'mouse') return;

  if (matchHotKey(currentHotKey, event)) {
    event.preventDefault();
    callback();
  }
}

/**
 * 加载快捷键配置
 */
async function loadHotKeyConfig(): Promise<void> {
  const config = await getConfig();
  currentHotKey = config.nextLinkHotKey;
}

/**
 * 初始化快捷键监听
 */
export function initHotKeyListener(onTrigger: HotKeyCallback): void {
  callback = onTrigger;

  // 加载配置
  loadHotKeyConfig();

  // 监听事件
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);
}

/**
 * 刷新快捷键配置
 */
export function refreshHotKeyConfig(): void {
  loadHotKeyConfig();
}

/**
 * 销毁快捷键监听
 */
export function destroyHotKeyListener(): void {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('mousedown', handleMouseDown);
  callback = null;
  currentHotKey = null;
}
