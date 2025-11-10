/**
 * AI Feature Type Definitions
 */

export interface AIOptions {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerationRequest {
  type: 'project' | 'feature' | 'code' | 'explanation' | 'optimization';
  prompt: string;
  context?: {
    existingCode?: string;
    projectType?: string;
    framework?: string;
    requirements?: string[];
  };
}

export interface AIGenerationResponse {
  success: boolean;
  code?: string;
  files?: GeneratedFile[];
  explanation?: string;
  steps?: string[];
  commands?: string[];
  error?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  dependencies: string[];
}

export interface AIProvider {
  name: string;
  initialize(): Promise<void>;
  generateCode(request: AIGenerationRequest): Promise<AIGenerationResponse>;
  explainCode(code: string, language: string): Promise<string>;
  optimizeCode(code: string, language: string): Promise<string>;
}
