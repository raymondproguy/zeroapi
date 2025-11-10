/**
 * Create new project command
 */

import fs from 'fs';
import path from 'path';
import { AIGenerator } from '../../src/features/ai/ai-generator.js';

export async function createProject(projectName: string, options: any) {
  console.log(`🚀 Creating new ZeroAPI project: ${projectName}`);
  
  if (options.ai) {
    return await createWithAI(projectName, options);
  } else if (options.template) {
    return await createFromTemplate(projectName, options.template);
  } else {
    return await createBasic(projectName);
  }
}

async function createWithAI(projectName: string, options: any) {
  console.log('🤖 Using AI to generate your project...');
  
  const ai = new AIGenerator({
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || 'demo-key'
  });

  await ai.initialize();

  let prompt = options.prompt;
  if (!prompt) {
    // Interactive prompt
    console.log('💬 Describe your project:');
    // In real CLI, we would read from stdin
    prompt = `A ${projectName} API with authentication and database`;
  }

  console.log(`🎯 Generating: ${prompt}`);
  
  const result = await ai.generateProject(prompt);
  
  if (result.success) {
    await generateProjectFiles(projectName, result);
    showNextSteps(projectName, result);
  } else {
    console.error('❌ AI generation failed:', result.error);
  }
}

async function createFromTemplate(projectName: string, template: string) {
  console.log(`📁 Creating from template: ${template}`);
  // Template-based project creation
}

async function createBasic(projectName: string) {
  console.log('📦 Creating basic ZeroAPI project...');
  // Basic project scaffold
}

async function generateProjectFiles(projectName: string, result: any) {
  const projectPath = path.join(process.cwd(), projectName);
  
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  }

  if (result.files) {
    for (const file of result.files) {
      const filePath = path.join(projectPath, file.path);
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, file.content);
      console.log(`📄 Created: ${file.path}`);
    }
  }

  console.log(`✅ Project created in ./${projectName}`);
}

function showNextSteps(projectName: string, result: any) {
  console.log('\n🎉 Project generated successfully!');
  console.log('\n📋 Next steps:');
  
  if (result.commands) {
    result.commands.forEach((cmd: string, index: number) => {
      console.log(`  ${index + 1}. ${cmd}`);
    });
  } else {
    console.log(`  1. cd ${projectName}`);
    console.log('  2. npm install');
    console.log('  3. npm run dev');
  }
  
  console.log('\n🚀 Happy coding!');
  console.log('💡 Need help? Run: zero ai --help');
}
