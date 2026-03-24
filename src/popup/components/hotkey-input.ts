import { parseKeyboardEvent, parseMouseEvent, getHotKeyDisplayText } from '@shared/utils/hotkey';
import type { HotKeyValue } from '@shared/types/config';
import type { ParsedHotKey } from '@shared/types/hotkey';

export interface HotKeyInputOptions {
  element: HTMLInputElement;
  initialValue: HotKeyValue;
  onChange: (value: HotKeyValue) => void;
}

/**
 * 创建快捷键输入组件
 */
export function createHotKeyInput(options: HotKeyInputOptions): {
  destroy: () => void;
  setValue: (value: HotKeyValue) => void;
} {
  const { element, initialValue, onChange } = options;
  let isRecording = false;
  let currentValue = initialValue;

  // 显示当前值
  function updateDisplay(): void {
    element.value = getHotKeyDisplayText(currentValue);
    const hint = element.parentElement?.querySelector('.hint') as HTMLElement | null;
    if (hint) {
      hint.style.display = isRecording ? 'block' : 'none';
    }
  }

  // 设置值
  function setValue(parsed: ParsedHotKey): void {
    currentValue = parsed.value;
    updateDisplay();
    onChange(currentValue);
  }

  // 开始录制
  function startRecording(): void {
    isRecording = true;
    element.value = '';
    element.focus();
    updateDisplay();
  }

  // 停止录制
  function stopRecording(): void {
    isRecording = false;
    updateDisplay();
  }

  // 键盘事件处理
  function handleKeyDown(event: KeyboardEvent): void {
    if (!isRecording) return;

    // 忽略单独的修饰键
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const parsed = parseKeyboardEvent(event);
    setValue(parsed);
    stopRecording();
  }

  // 鼠标事件处理
  function handleMouseDown(event: MouseEvent): void {
    if (!isRecording) {
      // 左键点击开始录制
      if (event.button === 0) {
        event.preventDefault();
        startRecording();
      }
      return;
    }

    // 录制中，如果有修饰键则记录鼠标快捷键
    if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey || event.button !== 0) {
      event.preventDefault();
      const parsed = parseMouseEvent(event);
      setValue(parsed);
      stopRecording();
    }
  }

  // 失焦停止录制
  function handleBlur(): void {
    if (isRecording) {
      stopRecording();
    }
  }

  // 绑定事件
  element.addEventListener('keydown', handleKeyDown);
  element.addEventListener('mousedown', handleMouseDown);
  element.addEventListener('blur', handleBlur);

  // 初始化显示
  updateDisplay();

  return {
    destroy: () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('blur', handleBlur);
    },
    setValue: (value: HotKeyValue) => {
      currentValue = value;
      updateDisplay();
    },
  };
}
