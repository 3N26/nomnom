import { registerContextMenus } from './services/context-menu';
import { registerMessageHandlers } from './handlers/message';
import { registerMenuClickHandler } from './handlers/menu-click';
import {
  removeTabGroupState,
  cleanupOrphanedTabGroupStates,
  handleTabClosed,
} from './services/tab-group';

// 扩展安装时注册右键菜单
chrome.runtime.onInstalled.addListener(() => {
  registerContextMenus();
});

// 注册消息处理器
registerMessageHandlers();

// 注册菜单点击处理器
registerMenuClickHandler();

// 监听标签组关闭事件，清理对应的存储数据
chrome.tabGroups.onRemoved.addListener((group) => {
  removeTabGroupState(group.id);
  console.log(`Tab group ${group.id} removed, cleaned up storage`);
});

// 监听 tab 关闭事件，更新计数
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (removeInfo.isWindowClosing) return;
  handleTabClosed(tabId);
});

// Service Worker 启动时清理孤儿数据
cleanupOrphanedTabGroupStates();

console.log('NomNom background service worker initialized');
