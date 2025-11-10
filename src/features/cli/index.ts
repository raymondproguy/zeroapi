#!/usr/bin/env node

/**
 * ZeroAPI CLI - The Magical Command Line Interface
 */

import { Command } from 'commander';
import { createProject } from './commands/create.js';
import { generateFeature } from './commands/generate.js';
import { explainCode, optimizeCode } from './commands/ai.js';

const program = new Command();

program
  .name('zero')
  .description('🚀 ZeroAPI CLI - AI-Powered Backend Development')
  .version('2.0.0');

// Create command
program
  .command('create <project-name>')
  .description('Create a new ZeroAPI project')
  .option('--ai', 'Use AI to generate project from description')
  .option('--template <template>', 'Use specific template (auth-api, ecommerce, blog, saas)')
  .option('--prompt <description>', 'Project description for AI generation')
  .action(createProject);

// Generate command  
program
  .command('generate <type> <name>')
  .description('Generate code features')
  .option('--prompt <description>', 'Feature description for AI generation')
  .action(generateFeature);

// AI commands
program
  .command('ai explain <code>')
  .description('Explain code using AI')
  .option('--language <lang>', 'Programming language', 'typescript')
  .action(explainCode);

program
  .command('ai optimize <code>')  
  .description('Optimize code using AI')
  .option('--language <lang>', 'Programming language', 'typescript')
  .action(optimizeCode);

// Dev command
program
  .command('dev')
  .description('Start development server with hot reload')
  .action(() => {
    console.log('🔥 Starting ZeroAPI development server...');
    // Start the dev server
  });

// Deploy command
program
  .command('deploy')
  .description('Deploy to production')
  .option('--provider <provider>', 'Deployment provider', 'vercel')
  .action(() => {
    console.log('🚀 Deploying ZeroAPI app...');
    // Deployment logic
  });

program.parse();
