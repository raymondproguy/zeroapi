/**
 * Deployment Type Definitions
 */

export interface DeploymentOptions {
  provider: 'vercel' | 'railway' | 'netlify' | 'docker';
  projectName?: string;
  environment?: 'production' | 'preview' | 'development';
  region?: string;
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
}

export interface DeploymentEnvironment {
  key: string;
  value: string;
  type: 'plain' | 'secret';
}

export interface DeploymentProject {
  id: string;
  name: string;
  url?: string;
  status: 'ready' | 'building' | 'error' | 'queued';
  createdAt: number;
  updatedAt: number;
}

export interface DeploymentResult {
  id: string;
  url: string;
  status: 'ready' | 'building' | 'error' | 'queued';
  logs?: string[];
  createdAt: number;
}

export interface DeploymentProvider {
  name: string;
  initialize(): Promise<void>;
  deploy(project: DeploymentProject, options: DeploymentOptions): Promise<DeploymentResult>;
  createProject(name: string, options: DeploymentOptions): Promise<DeploymentProject>;
  listProjects(): Promise<DeploymentProject[]>;
  getProject(id: string): Promise<DeploymentProject>;
  setEnvironmentVariables(projectId: string, variables: DeploymentEnvironment[]): Promise<void>;
  getDeploymentLogs(deploymentId: string): Promise<string[]>;
}
