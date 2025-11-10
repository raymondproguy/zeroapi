/**
 * Base Deployment Provider - All providers extend this
 */

import { DeploymentProvider, DeploymentOptions, DeploymentProject, DeploymentResult, DeploymentEnvironment } from '../types.js';

export abstract class BaseDeploymentProvider implements DeploymentProvider {
  abstract name: string;
  protected initialized: boolean = false;

  abstract initialize(): Promise<void>;
  abstract deploy(project: DeploymentProject, options: DeploymentOptions): Promise<DeploymentResult>;
  abstract createProject(name: string, options: DeploymentOptions): Promise<DeploymentProject>;
  abstract listProjects(): Promise<DeploymentProject[]>;
  abstract getProject(id: string): Promise<DeploymentProject>;
  abstract setEnvironmentVariables(projectId: string, variables: DeploymentEnvironment[]): Promise<void>;
  abstract getDeploymentLogs(deploymentId: string): Promise<string[]>;

  protected validateInitialization(): void {
    if (!this.initialized) {
      throw new Error(`Deployment provider ${this.name} is not initialized`);
    }
  }

  protected generateId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  protected validateProjectName(name: string): void {
    if (!name || name.length < 3) {
      throw new Error('Project name must be at least 3 characters long');
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
      throw new Error('Project name can only contain lowercase letters, numbers, and hyphens');
    }

    if (name.length > 50) {
      throw new Error('Project name must be less than 50 characters');
    }
  }

  protected sanitizeEnvironmentVariables(variables: DeploymentEnvironment[]): DeploymentEnvironment[] {
    return variables.filter(env => {
      // Remove empty values
      if (!env.key || !env.value) return false;
      
      // Don't expose sensitive keys in logs
      const sensitiveKeys = ['SECRET', 'PASSWORD', 'TOKEN', 'KEY', 'PRIVATE'];
      if (sensitiveKeys.some(sensitive => env.key.toUpperCase().includes(sensitive))) {
        env.value = '***' + env.value.slice(-4); // Show last 4 chars only
      }
      
      return true;
    });
  }

  protected generateDefaultBuildConfig(options: DeploymentOptions): any {
    return {
      buildCommand: options.buildCommand || 'npm run build',
      outputDirectory: options.outputDirectory || '.',
      installCommand: options.installCommand || 'npm install',
      environment: options.environment || 'production'
    };
  }

  protected formatProjectUrl(projectName: string, provider: string): string {
    const domains: Record<string, string> = {
      vercel: 'vercel.app',
      netlify: 'netlify.app',
      railway: 'railway.app'
    };
    
    const domain = domains[provider] || 'app.com';
    return `https://${projectName}.${domain}`;
  }
}
