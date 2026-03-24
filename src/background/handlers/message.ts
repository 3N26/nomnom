import { BackgroundChannel } from '@shared/types/messages';
import { onMessage, initMessageListener } from '@shared/services/message.service';
import { saveConfig } from '@shared/services/config.service';
import { startVisitLinks, goForward } from '../services/tab-group';
import { filterUnvisitedLinks } from '../services/history';

/** 待处理的链接（等待过滤） */
let pendingLinks: string[] = [];
let filterUnvisited = false;

/**
 * 注册所有消息处理器
 */
export function registerMessageHandlers(): void {
  // 初始化消息监听
  initMessageListener();

  // 日志消息
  onMessage(BackgroundChannel.LOG, (data) => {
    console.log('[Content]', ...data);
  });

  // 前进到下一个链接
  onMessage(BackgroundChannel.GO_FORWARD, async () => {
    await goForward();
  });

  // 更新链接列表（从 content script 收集）
  onMessage(BackgroundChannel.UPDATE_LINKS, (data) => {
    pendingLinks = data;
  });

  // 开始访问链接
  onMessage(BackgroundChannel.START_VISIT, async (data) => {
    let urls = data.length > 0 ? data : pendingLinks;

    // 如果需要过滤未访问链接
    if (filterUnvisited && urls.length > 0) {
      urls = await filterUnvisitedLinks(urls);
    }

    if (urls.length > 0) {
      await startVisitLinks(urls);
    }

    // 重置状态
    pendingLinks = [];
    filterUnvisited = false;
  });

  // 配置更新
  onMessage(BackgroundChannel.CONFIG_UPDATE, async (data) => {
    await saveConfig(data);
  });
}

/**
 * 设置是否过滤未访问链接
 */
export function setFilterUnvisited(value: boolean): void {
  filterUnvisited = value;
}
