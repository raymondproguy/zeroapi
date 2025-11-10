/**
 * ZeroAPI v2 Entry Point
 */

import { ZeroAPI } from './src/core/ZeroAPI.js';

export function zeroapi(): ZeroAPI {
  return new ZeroAPI();
}

export { ZeroAPI };
export * from './src/types/core.js';
export * from './src/types/features.js';

export default zeroapi;
