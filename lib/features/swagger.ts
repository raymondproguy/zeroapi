/**
 * Swagger Documentation Feature for ZeroAPI
 * Provides automatic OpenAPI documentation generation
 */

import { SwaggerOptions, RouteDoc } from '../core/types.js';

export class SwaggerDocs {
    private enabled: boolean = false;
    private options: SwaggerOptions;
    private routes: Map<string, any> = new Map();
    private basePath: string = '/api-docs';

    constructor(options: SwaggerOptions) {
        if (!options.title || !options.version) {
            throw new Error('Swagger requires title and version options');
        }

        this.options = {
            description: 'ZeroAPI Auto-generated Documentation',
            servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
            ...options
        };
    }

    /**
     * Enable Swagger documentation
     */
    enable(): this {
        this.enabled = true;
        return this;
    }

    /**
     * Document a route
     */
    documentRoute(method: string, path: string, docs: RouteDoc): void {
        const routeKey = `${method.toUpperCase()} ${path}`;
        this.routes.set(routeKey, docs);
    }

    /**
     * Generate OpenAPI specification
     */
    generateSpec(): any {
        const paths: any = {};

        for (const [routeKey, docs] of this.routes.entries()) {
            const [method, path] = routeKey.split(' ');
            const openApiPath = this.convertPathToOpenApi(path);

            if (!paths[openApiPath]) {
                paths[openApiPath] = {};
            }

            paths[openApiPath][method.toLowerCase()] = {
                summary: docs.summary,
                description: docs.description,
                parameters: docs.parameters?.map((param: any) => ({
                    name: param.name,
                    in: param.in,
                    description: param.description,
                    required: param.required || false,
                    schema: param.schema || { type: 'string' }
                })),
                responses: docs.responses || {
                    '200': { description: 'Success' },
                    '500': { description: 'Internal Server Error' }
                },
                tags: docs.tags || []
            };
        }

        return {
            openapi: '3.0.0',
            info: {
                title: this.options.title,
                version: this.options.version,
                description: this.options.description,
                contact: this.options.contact,
                license: this.options.license
            },
            servers: this.options.servers,
            paths,
            components: {
                schemas: {
                    Error: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                            message: { type: 'string' },
                            details: { type: 'object' }
                        }
                    }
                }
            }
        };
    }

    /**
     * Convert route path to OpenAPI format
     */
    private convertPathToOpenApi(path: string): string {
        return path.replace(/:(\w+)/g, '{$1}');
    }

    /**
     * Generate Swagger UI HTML
     */
    generateUI(): string {
        const spec = this.generateSpec();
        const specJson = JSON.stringify(spec);

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${this.options.title} - API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
        .top-bar { background: #1b1b1b; padding: 10px 0; text-align: center; color: white; }
        .top-bar h1 { margin: 0; font-size: 1.5em; }
    </style>
</head>
<body>
    <div class="top-bar">
        <h1>${this.options.title} API Documentation</h1>
    </div>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
    <script>
        const spec = ${specJson};
        
        SwaggerUIBundle({
            spec: spec,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ],
            layout: "BaseLayout"
        });
    </script>
</body>
</html>`;
    }

    /**
     * Get all documented routes
     */
    getRoutes(): Map<string, any> {
        return new Map(this.routes);
    }

    /**
     * Check if Swagger is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Set base path for Swagger UI
     */
    setBasePath(path: string): this {
        this.basePath = path;
        return this;
    }

    /**
     * Get base path
     */
    getBasePath(): string {
        return this.basePath;
    }
}

/**
 * Decorator for documenting routes
 */
export function Doc(docs: RouteDoc) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        // Store documentation metadata on the method
        if (!target._docs) {
            target._docs = new Map();
        }
        target._docs.set(propertyName, docs);
        return descriptor;
    };
}

/**
 * Utility for creating route documentation
 */
export class DocBuilder {
    static create(): RouteDoc {
        return {};
    }

    static summary(text: string): Partial<RouteDoc> {
        return { summary: text };
    }

    static description(text: string): Partial<RouteDoc> {
        return { description: text };
    }

    static parameter(name: string, location: 'query' | 'path' | 'header', options: any = {}): Partial<RouteDoc> {
        return {
            parameters: [{
                name,
                in: location,
                required: options.required || false,
                description: options.description,
                schema: options.schema
            }]
        };
    }

    static response(code: string, description: string, content?: any): Partial<RouteDoc> {
        return {
            responses: {
                [code]: { description, content }
            }
        };
    }

    static tags(...tags: string[]): Partial<RouteDoc> {
        return { tags };
    }
}
