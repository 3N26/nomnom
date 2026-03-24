/** 最后右键点击的元素 */
let lastContextMenuTarget: EventTarget | null = null;

/**
 * 设置最后右键点击的目标
 */
export function setContextMenuTarget(target: EventTarget | null): void {
  lastContextMenuTarget = target;
}

/**
 * 获取最后右键点击的目标
 */
export function getContextMenuTarget(): EventTarget | null {
  return lastContextMenuTarget;
}

/**
 * 构建元素的 CSS 选择器链
 */
function buildSelectorChain(element: HTMLElement): string | null {
  const chain: string[] = [];
  let current: HTMLElement | null = element;
  let foundClassedElement = false;

  while (current && current !== document.body) {
    const classes = Array.from(current.classList);
    const tagName = current.tagName.toLowerCase();

    if (classes.length > 0) {
      // 找到有 class 的元素
      const selector = [tagName, ...classes].join('.');
      chain.unshift(selector);
      foundClassedElement = true;
      break;
    } else {
      chain.unshift(tagName);
    }

    current = current.parentElement;
  }

  if (!foundClassedElement || chain.length === 0) {
    return null;
  }

  // 转义特殊字符
  return chain.join(' ').replace(/(:|\[|\]|,|=|@)/g, '\\$1');
}

/**
 * 从 NodeList 中提取 href
 */
function extractHrefs(elements: NodeListOf<Element>): string[] {
  const hrefs: string[] = [];
  const seen = new Set<string>();

  elements.forEach((el) => {
    if (el instanceof HTMLAnchorElement && el.href) {
      // 去重
      if (!seen.has(el.href)) {
        seen.add(el.href);
        hrefs.push(el.href);
      }
    }
  });

  return hrefs;
}

/**
 * 根据右键点击的元素收集相似链接
 */
export function collectSimilarLinks(target: EventTarget | null = lastContextMenuTarget): string[] {
  if (!target || !(target instanceof HTMLElement)) {
    return [];
  }

  // 找到最近的 anchor 元素
  const anchor = target.closest('a');
  if (!anchor) {
    return [];
  }

  // 构建选择器
  const selector = buildSelectorChain(anchor);
  if (!selector) {
    // 如果没有合适的选择器，只返回当前链接
    return anchor.href ? [anchor.href] : [];
  }

  // 查找所有匹配的元素
  try {
    const similarElements = document.querySelectorAll(selector);
    return extractHrefs(similarElements);
  } catch {
    // 选择器无效，返回当前链接
    return anchor.href ? [anchor.href] : [];
  }
}
