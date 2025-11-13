/**
 * ZeroAPI v2 Entry Point
 */

import { ZeroAPI } from './src/core/ZeroAPI.js';

export function zeroapi(): ZeroAPI {
  return new ZeroAPI();
/}

export { ZeroAPI };
export * from './src/types/core.js';
export * from './src/types/features.js';

// === SECURITY HEADERS FEATURE ===
export type { SecurityHeadersOptions } from './lib/core/types.js';
// === COMPRESSION FEATURE ===
export type { CompressionOptions } from './lib/core/types.js';
// === RATE LIMITING FEATURE ===
export type { RateLimitOptions } from './lib/core/types.js';
// === HOT RELOAD FEATURE ===
export { HotReload, DevUtils } from './lib/features/hot-reload.js';
export type { HotReloadOptions } from './lib/core/types.js';
// === SWAGGER DOCUMENTATION FEATURE ===
export { SwaggerDocs, Doc, DocBuilder } from './lib/features/swagger.js';
export type { SwaggerOptions, RouteDoc } from './lib/core/types.js';

export default zeroapi;
