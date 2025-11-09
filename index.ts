import { ZeroAPI } from './lib/core/ZeroAPI.js';

export function zeroapi(): ZeroAPI {
  return new ZeroAPI();
}

export { ZeroAPI };
// 🆕 Export error classes for users
export * from './lib/features/errors.js';

export type { SecurityHeadersOptions } from './lib/core/types.js';

export default zeroapi;
