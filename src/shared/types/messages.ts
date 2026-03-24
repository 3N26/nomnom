import type { ConfigUpdate } from './config';

/** Background 消息通道 */
export const BackgroundChannel = {
  LOG: 'Background.log',
  GO_FORWARD: 'Background.goForward',
  UPDATE_LINKS: 'Background.updateLinks',
  START_VISIT: 'Background.startVisit',
  CONFIG_UPDATE: 'Background.configUpdate',
} as const;

export type BackgroundChannelType = (typeof BackgroundChannel)[keyof typeof BackgroundChannel];

/** Content 消息通道 */
export const ContentChannel = {
  COLLECT_LINKS: 'Content.collectLinks',
  COLLECT_UNVISITED_LINKS: 'Content.collectUnvisitedLinks',
} as const;

export type ContentChannelType = (typeof ContentChannel)[keyof typeof ContentChannel];

/** 所有消息通道 */
export type ChannelType = BackgroundChannelType | ContentChannelType;

/** 消息负载类型映射 */
export interface MessagePayloadMap {
  [BackgroundChannel.LOG]: unknown[];
  [BackgroundChannel.GO_FORWARD]: undefined;
  [BackgroundChannel.UPDATE_LINKS]: string[];
  [BackgroundChannel.START_VISIT]: string[];
  [BackgroundChannel.CONFIG_UPDATE]: ConfigUpdate;
  [ContentChannel.COLLECT_LINKS]: undefined;
  [ContentChannel.COLLECT_UNVISITED_LINKS]: undefined;
}

/** 类型安全的消息 */
export interface TypedMessage<C extends ChannelType> {
  channel: C;
  data: MessagePayloadMap[C];
}

/** 消息处理器类型 */
export type MessageHandler<C extends ChannelType> = (
  data: MessagePayloadMap[C],
  sender: chrome.runtime.MessageSender
) => void | Promise<void>;
