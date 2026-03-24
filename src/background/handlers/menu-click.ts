import { ContentChannel } from '@shared/types/messages';
import { sendToActiveTab } from '@shared/services/message.service';
import { MenuId, MenuIdType } from '../services/context-menu';
import { setFilterUnvisited } from './message';

/**
 * 处理右键菜单点击
 */
export function handleMenuClick(info: chrome.contextMenus.OnClickData): void {
  const menuId = info.menuItemId as MenuIdType;

  switch (menuId) {
    case MenuId.NOM_LINKS:
      setFilterUnvisited(false);
      sendToActiveTab(ContentChannel.COLLECT_LINKS, undefined);
      break;

    case MenuId.NOM_UNVISITED_LINKS:
      setFilterUnvisited(true);
      sendToActiveTab(ContentChannel.COLLECT_UNVISITED_LINKS, undefined);
      break;
  }
}

/**
 * 注册菜单点击监听
 */
export function registerMenuClickHandler(): void {
  chrome.contextMenus.onClicked.addListener(handleMenuClick);
}
