import { NomNomConfig, ConfigUpdate, DEFAULT_CONFIG } from '../types/config';
import { StorageKey } from '../types/storage';

/**
 * 获取配置
 */
export async function getConfig(): Promise<NomNomConfig> {
  const result = await chrome.storage.local.get([StorageKey.CONFIG]);
  const stored = result[StorageKey.CONFIG] as Partial<NomNomConfig> | undefined;
  return { ...DEFAULT_CONFIG, ...stored };
}

/**
 * 保存配置
 */
export async function saveConfig(update: ConfigUpdate): Promise<NomNomConfig> {
  const current = await getConfig();
  const merged = { ...current, ...update };

  // 验证和规范化
  const validated: NomNomConfig = {
    ...merged,
    tabPoolCount: Math.max(
      1,
      isNaN(merged.tabPoolCount) ? DEFAULT_CONFIG.tabPoolCount : merged.tabPoolCount
    ),
    limitOpenLinkCount: Math.max(
      0,
      isNaN(merged.limitOpenLinkCount) ? DEFAULT_CONFIG.limitOpenLinkCount : merged.limitOpenLinkCount
    ),
  };

  await chrome.storage.local.set({ [StorageKey.CONFIG]: validated });
  return validated;
}

/**
 * 重置配置为默认值
 */
export async function resetConfig(): Promise<NomNomConfig> {
  await chrome.storage.local.set({ [StorageKey.CONFIG]: DEFAULT_CONFIG });
  return { ...DEFAULT_CONFIG };
}
