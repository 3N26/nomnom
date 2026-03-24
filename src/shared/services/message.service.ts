import type {
  ChannelType,
  MessagePayloadMap,
  TypedMessage,
  MessageHandler,
} from '../types/messages';

type HandlerEntry<C extends ChannelType> = {
  handler: MessageHandler<C>;
  needResponse: boolean;
};

const handlers = new Map<ChannelType, Array<HandlerEntry<ChannelType>>>();

/**
 * 订阅消息
 */
export function onMessage<C extends ChannelType>(
  channel: C,
  handler: MessageHandler<C>,
  needResponse = false
): () => void {
  const existing = handlers.get(channel) || [];
  const entry: HandlerEntry<C> = { handler, needResponse };
  existing.push(entry as HandlerEntry<ChannelType>);
  handlers.set(channel, existing);

  // 返回取消订阅函数
  return () => {
    const current = handlers.get(channel) || [];
    const index = current.indexOf(entry as HandlerEntry<ChannelType>);
    if (index > -1) {
      current.splice(index, 1);
    }
  };
}

/**
 * 发送消息到 Background
 */
export function sendToBackground<C extends ChannelType>(
  channel: C,
  data: MessagePayloadMap[C]
): Promise<void> | null {
  if (!chrome.runtime?.id) {
    console.warn('chrome.runtime not initialized');
    return null;
  }
  return chrome.runtime.sendMessage({ channel, data });
}

/**
 * 发送消息到 Content Script
 */
export async function sendToActiveTab<C extends ChannelType>(
  channel: C,
  data: MessagePayloadMap[C]
): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) return;
  return chrome.tabs.sendMessage(tab.id, { channel, data });
}

/**
 * 初始化消息监听
 */
export function initMessageListener(): void {
  chrome.runtime.onMessage.addListener(
    (message: TypedMessage<ChannelType>, sender, sendResponse) => {
      const { channel, data } = message;
      const channelHandlers = handlers.get(channel);
      if (!channelHandlers) return;

      let needsAsync = false;

      for (const { handler, needResponse } of channelHandlers) {
        const result = handler(data, sender);
        if (needResponse) {
          if (result instanceof Promise) {
            needsAsync = true;
            result.then(sendResponse);
          } else {
            sendResponse(result);
          }
        }
      }

      // 返回 true 保持异步响应通道开放
      return needsAsync;
    }
  );
}
