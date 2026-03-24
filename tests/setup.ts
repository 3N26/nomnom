import { vi } from 'vitest';

const createChromeMock = () => ({
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    },
    session: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
    group: vi.fn().mockResolvedValue(1),
    sendMessage: vi.fn().mockResolvedValue(undefined),
  },
  tabGroups: {
    update: vi.fn().mockResolvedValue({}),
  },
  runtime: {
    id: 'test-extension-id',
    sendMessage: vi.fn().mockResolvedValue(undefined),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: {
      addListener: vi.fn(),
    },
  },
  history: {
    getVisits: vi.fn().mockResolvedValue([]),
  },
});

(globalThis as unknown as { chrome: ReturnType<typeof createChromeMock> }).chrome =
  createChromeMock();
