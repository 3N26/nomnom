import { describe, it, expect, vi, beforeEach } from 'vitest';
import { splitLinksIntoBatches, getNextBatch } from '@background/services/tab-pool';
import { StorageKey } from '@shared/types/storage';

function mockConfig(tabPoolCount: number): void {
  (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({
    [StorageKey.CONFIG]: { tabPoolCount },
  });
}

function mockEmptyConfig(): void {
  (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockResolvedValue({});
}

describe('tab-pool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('splitLinksIntoBatches', () => {
    it('应该根据 tabPoolCount 分割链接', async () => {
      mockConfig(3);

      const urls = ['url1', 'url2', 'url3', 'url4', 'url5'];
      const [current, remaining] = await splitLinksIntoBatches(urls);

      expect(current).toEqual(['url1', 'url2', 'url3']);
      expect(remaining).toEqual(['url4', 'url5']);
    });

    it('当链接数小于 tabPoolCount 时，剩余应为空', async () => {
      mockConfig(5);

      const urls = ['url1', 'url2'];
      const [current, remaining] = await splitLinksIntoBatches(urls);

      expect(current).toEqual(['url1', 'url2']);
      expect(remaining).toEqual([]);
    });

    it('当链接数等于 tabPoolCount 时，剩余应为空', async () => {
      mockConfig(3);

      const urls = ['url1', 'url2', 'url3'];
      const [current, remaining] = await splitLinksIntoBatches(urls);

      expect(current).toEqual(['url1', 'url2', 'url3']);
      expect(remaining).toEqual([]);
    });

    it('当链接数组为空时，应返回两个空数组', async () => {
      mockConfig(3);

      const urls: string[] = [];
      const [current, remaining] = await splitLinksIntoBatches(urls);

      expect(current).toEqual([]);
      expect(remaining).toEqual([]);
    });

    it('应使用默认配置当 storage 为空时', async () => {
      mockEmptyConfig();

      const urls = ['url1', 'url2', 'url3', 'url4', 'url5'];
      const [current, remaining] = await splitLinksIntoBatches(urls);

      // 默认 tabPoolCount 为 3
      expect(current).toEqual(['url1', 'url2', 'url3']);
      expect(remaining).toEqual(['url4', 'url5']);
    });

    it('tabPoolCount 为 1 时应每次只返回一个链接', async () => {
      mockConfig(1);

      const urls = ['url1', 'url2', 'url3'];
      const [current, remaining] = await splitLinksIntoBatches(urls);

      expect(current).toEqual(['url1']);
      expect(remaining).toEqual(['url2', 'url3']);
    });
  });

  describe('getNextBatch', () => {
    it('应从剩余链接中获取下一批', async () => {
      mockConfig(2);

      const remaining = ['url3', 'url4', 'url5'];
      const [nextBatch, newRemaining] = await getNextBatch(remaining);

      expect(nextBatch).toEqual(['url3', 'url4']);
      expect(newRemaining).toEqual(['url5']);
    });

    it('当剩余链接少于 tabPoolCount 时应返回所有', async () => {
      mockConfig(5);

      const remaining = ['url1', 'url2'];
      const [nextBatch, newRemaining] = await getNextBatch(remaining);

      expect(nextBatch).toEqual(['url1', 'url2']);
      expect(newRemaining).toEqual([]);
    });

    it('当剩余链接为空时应返回空数组', async () => {
      mockConfig(3);

      const remaining: string[] = [];
      const [nextBatch, newRemaining] = await getNextBatch(remaining);

      expect(nextBatch).toEqual([]);
      expect(newRemaining).toEqual([]);
    });
  });
});
