import { deflate, inflate } from 'pako';

export const compressData = (data: string): Uint8Array => {
  return deflate(data, { level: 9 });
};

export const decompressData = (data: Uint8Array): string => {
  return inflate(data, { to: 'string' });
};
