import type { HotKeyValue } from '../types/config';
import type { ParsedHotKey, HotKeyInfo, KeyboardHotKeyInfo, MouseHotKeyInfo } from '../types/hotkey';

/** 检测是否为 Mac 系统 */
export function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

/** 获取修饰键显示名称 */
function getModifierDisplayName(modifier: string): string {
  if (isMac()) {
    switch (modifier) {
      case 'ctrl':
        return 'Control';
      case 'alt':
        return 'Option';
      case 'meta':
        return 'Command';
      default:
        return modifier.charAt(0).toUpperCase() + modifier.slice(1);
    }
  }
  return modifier.charAt(0).toUpperCase() + modifier.slice(1);
}

/** 获取按键显示名称 */
function getKeyDisplayName(key: string): string {
  const keyMap: Record<string, string> = {
    ArrowLeft: '←',
    ArrowRight: '→',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ' ': 'Space',
  };
  return keyMap[key] || key;
}

/** 获取鼠标按钮显示名称 */
function getMouseButtonDisplayName(button: number): string {
  const buttonMap: Record<number, string> = {
    0: 'Left Click',
    1: 'Middle Click',
    2: 'Right Click',
    3: 'Back',
    4: 'Forward',
  };
  return buttonMap[button] || `Button ${button}`;
}

/** 从键盘事件解析快捷键 */
export function parseKeyboardEvent(event: KeyboardEvent): ParsedHotKey {
  const modifiers: string[] = [];

  if (event.ctrlKey) modifiers.push(getModifierDisplayName('ctrl'));
  if (event.shiftKey) modifiers.push('Shift');
  if (event.altKey) modifiers.push(getModifierDisplayName('alt'));
  if (event.metaKey) modifiers.push(getModifierDisplayName('meta'));

  const key = getKeyDisplayName(event.key);
  const parts = [...modifiers, key];
  const displayText = parts.join(' + ');

  return {
    displayText,
    value: `keyboard:${displayText}`,
  };
}

/** 从鼠标事件解析快捷键 */
export function parseMouseEvent(event: MouseEvent): ParsedHotKey {
  const modifiers: string[] = [];

  if (event.ctrlKey) modifiers.push(getModifierDisplayName('ctrl'));
  if (event.shiftKey) modifiers.push('Shift');
  if (event.altKey) modifiers.push(getModifierDisplayName('alt'));
  if (event.metaKey) modifiers.push(getModifierDisplayName('meta'));

  const button = getMouseButtonDisplayName(event.button);
  const parts = [...modifiers, button];
  const displayText = parts.join(' + ');

  return {
    displayText,
    value: `mouse:${displayText}`,
  };
}

/** 从存储值解析快捷键信息 */
export function parseStoredHotKey(value: HotKeyValue): HotKeyInfo | null {
  if (value.startsWith('keyboard:')) {
    const combo = value.slice('keyboard:'.length);
    const parts = combo.split(' + ');
    const key = parts.pop() || '';

    return {
      type: 'keyboard',
      ctrl: parts.some((p) => p.toLowerCase() === 'control' || p.toLowerCase() === 'ctrl'),
      shift: parts.some((p) => p.toLowerCase() === 'shift'),
      alt: parts.some((p) => p.toLowerCase() === 'option' || p.toLowerCase() === 'alt'),
      meta: parts.some((p) => p.toLowerCase() === 'command' || p.toLowerCase() === 'meta'),
      key: key === '←' ? 'ArrowLeft' : key === '→' ? 'ArrowRight' : key === '↑' ? 'ArrowUp' : key === '↓' ? 'ArrowDown' : key,
    };
  }

  if (value.startsWith('mouse:')) {
    const combo = value.slice('mouse:'.length);
    const parts = combo.split(' + ');
    const buttonName = parts.pop() || '';

    const buttonMap: Record<string, number> = {
      'Left Click': 0,
      'Middle Click': 1,
      'Right Click': 2,
      Back: 3,
      Forward: 4,
    };

    return {
      type: 'mouse',
      ctrl: parts.some((p) => p.toLowerCase() === 'control' || p.toLowerCase() === 'ctrl'),
      shift: parts.some((p) => p.toLowerCase() === 'shift'),
      alt: parts.some((p) => p.toLowerCase() === 'option' || p.toLowerCase() === 'alt'),
      meta: parts.some((p) => p.toLowerCase() === 'command' || p.toLowerCase() === 'meta'),
      button: buttonMap[buttonName] ?? 0,
    };
  }

  return null;
}

/** 检查键盘事件是否匹配快捷键 */
export function matchKeyboardHotKey(info: KeyboardHotKeyInfo, event: KeyboardEvent): boolean {
  return (
    info.ctrl === event.ctrlKey &&
    info.shift === event.shiftKey &&
    info.alt === event.altKey &&
    info.meta === event.metaKey &&
    info.key === event.key
  );
}

/** 检查鼠标事件是否匹配快捷键 */
export function matchMouseHotKey(info: MouseHotKeyInfo, event: MouseEvent): boolean {
  return (
    info.ctrl === event.ctrlKey &&
    info.shift === event.shiftKey &&
    info.alt === event.altKey &&
    info.meta === event.metaKey &&
    info.button === event.button
  );
}

/** 检查事件是否匹配存储的快捷键 */
export function matchHotKey(stored: HotKeyValue, event: KeyboardEvent | MouseEvent): boolean {
  const info = parseStoredHotKey(stored);
  if (!info) return false;

  if (info.type === 'keyboard' && event instanceof KeyboardEvent) {
    return matchKeyboardHotKey(info, event);
  }

  if (info.type === 'mouse' && event instanceof MouseEvent) {
    return matchMouseHotKey(info, event);
  }

  return false;
}

/** 获取快捷键的显示文本 */
export function getHotKeyDisplayText(value: HotKeyValue): string {
  if (value.startsWith('keyboard:')) {
    return value.slice('keyboard:'.length);
  }
  if (value.startsWith('mouse:')) {
    return value.slice('mouse:'.length);
  }
  return value;
}
