import { TabGroupState, createTabGroupStorageKey } from '@shared/types/storage';
import { splitLinksIntoBatches } from './tab-pool';

/**
 * 创建标签组状态
 */
function createTabGroupState(urls: string[], total: number, tabIds: number[]): TabGroupState {
  return {
    urls,
    visited: 1, // 从 1 开始，因为第一个 tab 已打开
    total,
    tabIds,
  };
}

/**
 * 保存标签组状态
 */
async function saveTabGroupState(groupId: number, state: TabGroupState): Promise<void> {
  const key = createTabGroupStorageKey(groupId);
  await chrome.storage.session.set({ [key]: state });
}

/**
 * 获取标签组状态
 */
async function getTabGroupState(groupId: number): Promise<TabGroupState | null> {
  const key = createTabGroupStorageKey(groupId);
  const result = await chrome.storage.session.get([key]);
  return (result[key] as TabGroupState) || null;
}

/**
 * 删除标签组状态
 */
export async function removeTabGroupState(groupId: number): Promise<void> {
  const key = createTabGroupStorageKey(groupId);
  await chrome.storage.session.remove([key]);
}

/**
 * 处理 tab 被手动关闭的情况
 */
export async function handleTabClosed(tabId: number): Promise<void> {
  // 查找该 tab 属于哪个 group
  const storage = await chrome.storage.session.get(null);
  const tabGroupKeys = Object.keys(storage).filter((key) => key.startsWith('tabGroup:'));

  for (const key of tabGroupKeys) {
    const state = storage[key] as TabGroupState;
    if (!state.tabIds?.includes(tabId)) continue;

    const groupId = parseInt(key.replace('tabGroup:', ''), 10);

    // 从 tabIds 中移除
    state.tabIds = state.tabIds.filter((id) => id !== tabId);
    // 更新访问计数（手动关闭也算访问过）
    state.visited++;

    await saveTabGroupState(groupId, state);
    await updateTabGroupTitle(groupId, state.visited, state.total);

    // 如果组内没有 tab 了，清理状态
    if (state.tabIds.length === 0) {
      await removeTabGroupState(groupId);
    }
    break;
  }
}

/**
 * 清理所有孤儿标签组状态（启动时调用）
 */
export async function cleanupOrphanedTabGroupStates(): Promise<void> {
  const storage = await chrome.storage.session.get(null);
  const tabGroupKeys = Object.keys(storage).filter((key) => key.startsWith('tabGroup:'));

  if (tabGroupKeys.length === 0) return;

  // 获取所有存在的标签组 ID
  const existingGroupIds = new Set<number>();
  try {
    const allTabs = await chrome.tabs.query({});
    allTabs.forEach((tab) => {
      if (tab.groupId && tab.groupId !== -1) {
        existingGroupIds.add(tab.groupId);
      }
    });
  } catch {
    return;
  }

  // 删除不存在的标签组的状态
  const keysToRemove = tabGroupKeys.filter((key) => {
    const groupId = parseInt(key.replace('tabGroup:', ''), 10);
    return !existingGroupIds.has(groupId);
  });

  if (keysToRemove.length > 0) {
    await chrome.storage.session.remove(keysToRemove);
    console.log(`Cleaned up ${keysToRemove.length} orphaned tab group states`);
  }
}

/** 随机 icon 列表 */
const GROUP_ICONS = [
  // 快餐
  '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆',
  // 亚洲美食
  '🍜', '🍝', '🍣', '🍤', '🍱', '🥟', '🍚', '🍛', '🍲',
  // 甜点
  '🍩', '🍪', '🧁', '🍰', '🎂', '🍮', '🍦', '🍨', '🍧',
  // 水果
  '🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍌',
  // 其他
  '🥐', '🥖', '🧀', '🥚', '🥓', '🍿', '🥤', '🧃', '☕',
];

/** Chrome tab group 支持的颜色 */
const GROUP_COLORS: chrome.tabGroups.ColorEnum[] = [
  'blue',
  'red',
  'yellow',
  'green',
  'pink',
  'purple',
  'cyan',
  'orange',
];

/** 为每个 groupId 缓存的颜色（颜色保持不变） */
const groupColorCache = new Map<number, chrome.tabGroups.ColorEnum>();

/**
 * 获取随机 icon
 */
function getRandomIcon(): string {
  return GROUP_ICONS[Math.floor(Math.random() * GROUP_ICONS.length)];
}

/**
 * 获取或生成 group 的颜色（颜色保持不变）
 */
function getGroupColor(groupId: number): chrome.tabGroups.ColorEnum {
  let color = groupColorCache.get(groupId);
  if (!color) {
    color = GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
    groupColorCache.set(groupId, color);
  }
  return color;
}

/**
 * 更新标签组标题显示进度
 */
async function updateTabGroupTitle(groupId: number, visited: number, total: number): Promise<void> {
  const icon = getRandomIcon();
  const color = getGroupColor(groupId);
  await chrome.tabGroups.update(groupId, {
    title: `${icon} ${visited}/${total}`,
    color,
  });
}

/**
 * 创建标签并分组
 */
async function createTabsInGroup(
  urls: string[],
  windowId: number
): Promise<{ tabs: chrome.tabs.Tab[]; groupId: number }> {
  // 创建所有标签
  const tabs = await Promise.all(
    urls.map((url) =>
      chrome.tabs.create({
        url,
        active: false,
        windowId,
      })
    )
  );

  // 将标签分组
  const tabIds = tabs.map((t) => t.id).filter((id): id is number => id !== undefined);
  const groupId = await chrome.tabs.group({ tabIds, createProperties: { windowId } });

  return { tabs, groupId };
}

/**
 * 开始访问链接组
 * @param urls 所有要访问的链接
 * @returns 创建的标签组 ID
 */
export async function startVisitLinks(urls: string[]): Promise<number | null> {
  if (urls.length === 0) return null;

  // 获取当前窗口
  const [currentTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const windowId = currentTab?.windowId;
  if (!windowId) return null;

  // 分割链接
  const [currentBatch, remaining] = await splitLinksIntoBatches(urls);

  // 创建标签和分组
  const { tabs, groupId } = await createTabsInGroup(currentBatch, windowId);

  // 获取创建的 tabIds
  const tabIds = tabs.map((t) => t.id).filter((id): id is number => id !== undefined);

  // 保存状态
  const state = createTabGroupState(remaining, urls.length, tabIds);
  await saveTabGroupState(groupId, state);

  // 更新标题（从 1 开始，因为第一个 tab 已打开）
  await updateTabGroupTitle(groupId, 1, urls.length);

  // 激活第一个标签
  if (tabs[0]?.id) {
    await chrome.tabs.update(tabs[0].id, { active: true });
  }

  return groupId;
}

/**
 * 前进到下一个链接
 */
export async function goForward(): Promise<void> {
  // 获取当前标签
  const [currentTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!currentTab?.id || !currentTab.groupId || currentTab.groupId === -1) return;

  const groupId = currentTab.groupId;
  const state = await getTabGroupState(groupId);
  if (!state) return;

  // 更新访问计数
  state.visited++;

  // 获取同组的所有标签
  const groupTabs = await chrome.tabs.query({ groupId });
  const currentIndex = groupTabs.findIndex((t) => t.id === currentTab.id);

  // 计算下一个标签的索引
  const nextIndex = currentIndex + 1 < groupTabs.length ? currentIndex + 1 : 0;
  const nextTab = groupTabs[nextIndex];

  // 如果还有剩余链接，用新链接替换当前 tab
  if (state.urls.length > 0) {
    const [nextUrl, ...remaining] = state.urls;
    state.urls = remaining;

    // 替换当前 tab 的 URL（位置不变）
    await chrome.tabs.update(currentTab.id, { url: nextUrl });

    // 激活下一个标签
    if (nextTab?.id) {
      await chrome.tabs.update(nextTab.id, { active: true });
    }
  } else {
    // 没有剩余链接，关闭当前 tab
    // 先从 tabIds 中移除，避免 handleTabClosed 重复计数
    state.tabIds = state.tabIds.filter((id) => id !== currentTab.id);

    // 先激活下一个标签（如果存在且不是当前 tab）
    if (nextTab?.id && nextTab.id !== currentTab.id) {
      await chrome.tabs.update(nextTab.id, { active: true });
    }

    // 再关闭当前 tab
    await chrome.tabs.remove(currentTab.id);
  }

  // 保存状态并更新标题
  await saveTabGroupState(groupId, state);
  await updateTabGroupTitle(groupId, state.visited, state.total);

  // 如果组内没有 tab 了，清理状态
  if (state.tabIds.length === 0) {
    await removeTabGroupState(groupId);
  }
}
