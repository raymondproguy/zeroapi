import { ZeroAPI } from './lib/core/ZeroAPI.js';

export function zeroapi(): ZeroAPI {
  return new ZeroAPI();
}

export { ZeroAPI };
// 🆕 Export error classes for users
export * from './lib/features/errors.js';
export type { SecurityHeadersOptions } from './lib/core/types.js';
export type { CompressionOptions } from './lib/core/types.js'
export type { RateLimitOptions} from './lib/core/types.js'
export { HotReload, DevUtils } from './lib/features/hot-reload.js';
export type { HotReloadOptions } from './lib/core/types.js';

export default zeroapi;
