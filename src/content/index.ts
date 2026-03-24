import { BackgroundChannel, ContentChannel } from '@shared/types/messages';
import { sendToBackground, onMessage, initMessageListener } from '@shared/services/message.service';
import { getConfig } from '@shared/services/config.service';
import { collectSimilarLinks, setContextMenuTarget } from './services/link-collector';
import { initHotKeyListener, refreshHotKeyConfig } from './services/hotkey-listener';

/**
 * 收集并发送链接
 */
async function collectAndSendLinks(): Promise<void> {
  const links = collectSimilarLinks();
  const { limitOpenLinkCount } = await getConfig();

  // 应用限制
  const limitedLinks = limitOpenLinkCount > 0 ? links.slice(0, limitOpenLinkCount) : links;

  // 先发送链接列表
  sendToBackground(BackgroundChannel.UPDATE_LINKS, limitedLinks);

  // 然后触发开始访问
  sendToBackground(BackgroundChannel.START_VISIT, []);
}

/**
 * 监听右键菜单事件，记录点击目标
 */
function setupContextMenuListener(): void {
  document.addEventListener('contextmenu', (event) => {
    setContextMenuTarget(event.target);
  });
}

/**
 * 注册消息处理器
 */
function registerContentMessageHandlers(): void {
  initMessageListener();

  // 收集所有链接
  onMessage(ContentChannel.COLLECT_LINKS, () => {
    collectAndSendLinks();
  });

  // 收集未访问链接（实际过滤在 background 中进行）
  onMessage(ContentChannel.COLLECT_UNVISITED_LINKS, () => {
    collectAndSendLinks();
  });

  // 配置更新时刷新快捷键
  onMessage(BackgroundChannel.CONFIG_UPDATE, () => {
    refreshHotKeyConfig();
  });
}

/**
 * 初始化 Content Script
 */
function init(): void {
  // 设置右键菜单监听
  setupContextMenuListener();

  // 注册消息处理器
  registerContentMessageHandlers();

  // 初始化快捷键监听
  initHotKeyListener(() => {
    sendToBackground(BackgroundChannel.GO_FORWARD, undefined);
  });

  console.log('NomNom content script initialized');
}

// 启动
init();
