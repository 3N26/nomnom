import { getConfig, saveConfig } from '@shared/services/config.service';
import { BackgroundChannel } from '@shared/types/messages';
import { sendToBackground } from '@shared/services/message.service';
import type { ConfigUpdate } from '@shared/types/config';
import { createHotKeyInput } from './components/hotkey-input';

/** 应用 i18n 翻译 */
function applyI18n(): void {
  // 翻译 textContent
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const message = chrome.i18n.getMessage(key);
      if (message) {
        el.textContent = message;
      }
    }
  });

  // 翻译 placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      const message = chrome.i18n.getMessage(key);
      if (message && el instanceof HTMLInputElement) {
        el.placeholder = message;
      }
    }
  });

  // 设置 html lang 属性
  const lang = chrome.i18n.getUILanguage();
  document.documentElement.lang = lang;
}

/** 防抖函数 */
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: number | undefined;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  }) as T;
}

/** 通知配置更新 */
async function notifyConfigUpdate(update: ConfigUpdate): Promise<void> {
  await saveConfig(update);
  sendToBackground(BackgroundChannel.CONFIG_UPDATE, update);
}

/** 初始化表单 */
async function initForm(): Promise<void> {
  const config = await getConfig();

  // Tab Pool Count
  const tabPoolCountInput = document.getElementById('tabPoolCount') as HTMLInputElement;
  tabPoolCountInput.value = String(config.tabPoolCount);
  tabPoolCountInput.addEventListener(
    'input',
    debounce(() => {
      const value = parseInt(tabPoolCountInput.value, 10);
      if (!isNaN(value) && value >= 1) {
        notifyConfigUpdate({ tabPoolCount: value });
      }
    }, 300)
  );

  // Next Tab Shortcut
  const shortcutInput = document.getElementById('nextTabShortcut') as HTMLInputElement;
  createHotKeyInput({
    element: shortcutInput,
    initialValue: config.nextLinkHotKey,
    onChange: (value) => {
      notifyConfigUpdate({ nextLinkHotKey: value });
    },
  });

  // Limit Open Link Count
  const limitInput = document.getElementById('limitOpenLinkCount') as HTMLInputElement;
  limitInput.value = String(config.limitOpenLinkCount);
  limitInput.addEventListener(
    'input',
    debounce(() => {
      const value = parseInt(limitInput.value, 10);
      if (!isNaN(value) && value >= 0) {
        notifyConfigUpdate({ limitOpenLinkCount: value });
      }
    }, 300)
  );
}

// 启动
document.addEventListener('DOMContentLoaded', () => {
  applyI18n();
  initForm();
});
