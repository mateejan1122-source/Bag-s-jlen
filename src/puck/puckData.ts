import type { Data } from '@measured/puck';

export const EMPTY_PUCK_DATA: Data = {
  content: [],
  root: {},
  zones: {},
};

export const normalizePuckData = (value: unknown): Data => {
  if (!value || typeof value !== 'object') {
    return EMPTY_PUCK_DATA;
  }

  const candidate = value as Partial<Data>;

  return {
    content: Array.isArray(candidate.content) ? candidate.content : [],
    root: candidate.root && typeof candidate.root === 'object' ? candidate.root : {},
    zones: candidate.zones && typeof candidate.zones === 'object' ? candidate.zones : {},
  };
};

