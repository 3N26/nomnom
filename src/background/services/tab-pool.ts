import { getConfig } from '@shared/services/config.service';

/**
 * 将链接数组分割成当前批次和剩余批次
 * @param urls 链接数组
 * @returns [当前批次, 剩余批次]
 */
export async function splitLinksIntoBatches(urls: string[]): Promise<[string[], string[]]> {
  const { tabPoolCount } = await getConfig();
  const currentBatch = urls.slice(0, tabPoolCount);
  const remaining = urls.slice(tabPoolCount);
  return [currentBatch, remaining];
}

/**
 * 获取下一批链接
 * @param remaining 剩余链接
 * @returns [下一批, 新的剩余]
 */
export async function getNextBatch(remaining: string[]): Promise<[string[], string[]]> {
  return splitLinksIntoBatches(remaining);
}
