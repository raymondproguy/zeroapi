import { ZeroAPI } from './lib/core/ZeroAPI.js';

export function createApp(): ZeroAPI {
  return new ZeroAPI();
}

export { ZeroAPI };
export default createApp;
