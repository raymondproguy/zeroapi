/**
 * Main Deployment Class - One-command deployment
 */

import { DeploymentOptions, DeploymentProvider, DeploymentProject, DeploymentResult, DeploymentEnvironment } from './types.js';
import { VercelProvider } from './providers/vercel.js';
import { RailwayProvider } from './providers/railway.js';
import { NetlifyProvider } from './providers/netlify.js';
import { DockerProvider } from './providers/docker.js';

export class Deployment {
  private provider: DeploymentProvider;
  private options: DeploymentOptions;

  constructor(options: DeploymentOptions = { provider: 'vercel' }) {
    this.options = options;
    this.provider = this.createProvider(options);
  }

  private createProvider(options: DeploymentOptions): DeploymentProvider {
    switch (options.provider) {
      case 'railway':
        return new RailwayProvider(options);
      case 'netlify':
        return new NetlifyProvider(options);
      case 'docker':
        return new DockerProvider(options);
      case 'vercel':
      default:
        return new VercelProvider(options);
    }
  }

  async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  // Core deployment operations
  async createProject(name: string, options?: DeploymentOptions): Promise<DeploymentProject> {
    const deployOptions = { ...this.options, ...options };
    return await this.provider.createProject(name, deployOptions);
  }

  async deploy(project: DeploymentProject, options?: DeploymentOptions): Promise<DeploymentResult> {
    const deployOptions = { ...this.options, ...options };
    return await this.provider.deploy(project, deployOptions);
  }

  // Quick deploy - create project and deploy in one command
  async quickDeploy(name: string, options?: DeploymentOptions): Promise<{ project: DeploymentProject; deployment: DeploymentResult }> {
    console.log(`🚀 Quick deploying: ${name}`);
    
    const project = await this.createProject(name, options);
    const deployment = await this.deploy(project, options);
    
    return { project, deployment };
  }

  // Project management
  async listProjects(): Promise<DeploymentProject[]> {
    return await this.provider.listProjects();
  }

  async getProject(id: string): Promise<DeploymentProject> {
    return await this.provider.getProject(id);
  }

  // Environment management
  async setEnvironmentVariables(projectId: string, variables: DeploymentEnvironment[]): Promise<void> {
    return await this.provider.setEnvironmentVariables(projectId, variables);
  }

  async addEnvironmentVariable(projectId: string, key: string, value: string, type: 'plain' | 'secret' = 'plain'): Promise<void> {
    const variable: DeploymentEnvironment = { key, value, type };
    await this.setEnvironmentVariables(projectId, [variable]);
  }

  // Deployment monitoring
  async getDeploymentLogs(deploymentId: string): Promise<string[]> {
    return await this.provider.getDeploymentLogs(deploymentId);
  }

  // Utility methods
  getProviderName(): string {
    return this.provider.name;
  }

  isInitialized(): boolean {
    return (this.provider as any).initialized === true;
  }

  getSupportedProviders(): string[] {
    return ['vercel', 'railway', 'netlify', 'docker'];
  }

  // Auto-detect and suggest best provider
  suggestProvider(): string {
    // Simple heuristic based on project type
    if (this.options.buildCommand?.includes('docker')) {
      return 'docker';
    } else if (this.options.outputDirectory === 'dist' || this.options.outputDirectory === 'build') {
      return 'netlify';
    } else {
      return 'vercel'; // Default to Vercel for Node.js apps
    }
  }
}
