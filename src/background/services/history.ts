/**
 * 检查 URL 是否已访问过
 */
export async function isUrlVisited(url: string): Promise<boolean> {
  const visits = await chrome.history.getVisits({ url });
  return visits.length > 0;
}

/**
 * 过滤出未访问过的链接
 */
export async function filterUnvisitedLinks(urls: string[]): Promise<string[]> {
  const results = await Promise.all(
    urls.map(async (url) => ({
      url,
      visited: await isUrlVisited(url),
    }))
  );

  return results.filter((r) => !r.visited).map((r) => r.url);
}
