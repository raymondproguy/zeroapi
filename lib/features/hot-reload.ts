/**
 * Hot Reload Feature for ZeroAPI
 * Provides automatic server restart on file changes during development
 */

import { watch, WatchOptions } from 'fs';
import { join, relative, extname } from 'path';
import { fileURLToPath } from 'url';
import { HotReloadOptions } from '../core/types.js';

export class HotReload {
    private enabled: boolean = false;
    private options: Required<HotReloadOptions>;
    private watchers: any[] = [];
    private restartCallback?: () => void;

    constructor(options: HotReloadOptions = {}) {
        this.options = {
            watchDirs: ['./routes', './lib', './middleware'],
            extensions: ['.ts', '.js', '.json'],
            delay: 300,
            ...options
        };
    }

    /**
     * Enable hot reload
     */
    enable(): this {
        if (process.env.NODE_ENV !== 'development') {
            console.log('🔧 Hot reload is only available in development mode');
            return this;
        }

        this.enabled = true;
        this.startWatching();
        return this;
    }

    /**
     * Set restart callback (called when files change)
     */
    onRestart(callback: () => void): this {
        this.restartCallback = callback;
        return this;
    }

    /**
     * Start watching files for changes
     */
    private startWatching(): void {
        console.log('🔥 Hot reload enabled - watching for file changes...');

        const watchOptions: WatchOptions = {
            recursive: true,
            persistent: true
        };

        for (const dir of this.options.watchDirs) {
            try {
                const watcher = watch(dir, watchOptions, (eventType, filename) => {
                    if (!filename) return;

                    const fileExt = extname(filename);
                    if (this.options.extensions.includes(fileExt)) {
                        this.handleFileChange(filename, eventType);
                    }
                });

                this.watchers.push(watcher);
                console.log(`   👀 Watching: ${dir}`);
            } catch (error) {
                console.log(`   ⚠️  Could not watch directory: ${dir}`);
            }
        }
    }

    /**
     * Handle file change event
     */
    private handleFileChange(filename: string, eventType: string): void {
        if (this.shouldIgnoreFile(filename)) return;

        console.log(`\n🔄 File ${eventType}: ${filename}`);
        this.scheduleRestart();
    }

    /**
     * Check if file should be ignored
     */
    private shouldIgnoreFile(filename: string): boolean {
        const ignoredPatterns = [
            /node_modules/,
            /\.git/,
            /dist\//,
            /\.swp$/,
            /\.tmp$/,
            /~$/
        ];

        return ignoredPatterns.some(pattern => pattern.test(filename));
    }

    /**
     * Schedule server restart with debouncing
     */
    private scheduleRestart(): void {
        // Clear any existing restart timeout
        if ((global as any).hotReloadTimeout) {
            clearTimeout((global as any).hotReloadTimeout);
        }

        // Set new restart timeout
        (global as any).hotReloadTimeout = setTimeout(() => {
            this.restartServer();
        }, this.options.delay);
    }

    /**
     * Restart the server
     */
    private restartServer(): void {
        console.log('🚀 Restarting server...');

        // Clear require cache for changed files
        this.clearCache();

        // Call restart callback if provided
        if (this.restartCallback) {
            this.restartCallback();
        }

        console.log('✅ Server restarted successfully!\n');
    }

    /**
     * Clear Node.js require cache for project files
     */
    private clearCache(): void {
        const projectRoot = process.cwd();
        
        for (const key in require.cache) {
            // Only clear cache for project files, not node_modules
            if (key.startsWith(projectRoot) && !key.includes('node_modules')) {
                delete require.cache[key];
            }
        }
    }

    /**
     * Stop watching files
     */
    disable(): void {
        this.enabled = false;
        
        for (const watcher of this.watchers) {
            watcher.close();
        }
        
        this.watchers = [];
        
        if ((global as any).hotReloadTimeout) {
            clearTimeout((global as any).hotReloadTimeout);
        }

        console.log('🔧 Hot reload disabled');
    }

    /**
     * Check if hot reload is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Get current watch statistics
     */
    getStats(): { watching: number; directories: string[] } {
        return {
            watching: this.watchers.length,
            directories: this.options.watchDirs
        };
    }
}

/**
 * Development utilities for hot reload
 */
export class DevUtils {
    /**
     * Check if running in development mode
     */
    static isDevelopment(): boolean {
        return process.env.NODE_ENV === 'development';
    }

    /**
     * Create a development-friendly error handler
     */
    static createDevErrorHandler() {
        return (error: any, req: any, res: any) => {
            console.error('💥 Development Error:', error);
            
            if (DevUtils.isDevelopment()) {
                res.status(500).json({
                    error: error.message,
                    stack: error.stack,
                    details: 'This detailed error is only shown in development'
                });
            } else {
                res.status(500).json({
                    error: 'Internal Server Error'
                });
            }
        };
    }

    /**
     * Pretty print route information
     */
    static printRoutes(routes: any[]): void {
        if (!DevUtils.isDevelopment()) return;

        console.log('\n🛣️  Registered Routes:');
        routes.forEach(route => {
            console.log(`   ${route.method.padEnd(6)} ${route.path}`);
        });
        console.log('');
    }
}
