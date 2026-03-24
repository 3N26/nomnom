/** 菜单项 ID */
export const MenuId = {
  NOM_LINKS: 'nomLinks',
  NOM_UNVISITED_LINKS: 'nomUnvisitedLinks',
} as const;

export type MenuIdType = (typeof MenuId)[keyof typeof MenuId];

/**
 * 注册右键菜单
 */
export function registerContextMenus(): void {
  chrome.contextMenus.create({
    id: MenuId.NOM_LINKS,
    title: 'Nom links',
    contexts: ['link'],
  });

  chrome.contextMenus.create({
    id: MenuId.NOM_UNVISITED_LINKS,
    title: 'Nom unvisited links',
    contexts: ['link'],
  });
}
