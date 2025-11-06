import { ZeroAPI } from './lib/core/ZeroAPI.js';

export function zeroapi(): ZeroAPI {
  return new ZeroAPI();
}

export { ZeroAPI };
// 🆕 Export error classes for users
export * from './lib/features/errors.js';

export default zeroapi;
