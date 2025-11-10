/**
 * AI Interaction commands
 */

import { AIGenerator } from '../../src/features/ai/ai-generator.js';

export async function explainCode(code: string, options: any) {
  console.log('📚 AI Code Explanation');
  
  const ai = new AIGenerator({
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || 'demo-key' 
  });

  await ai.initialize();

  const explanation = await ai.explainCode(code, options.language || 'typescript');
  
  console.log('\n💡 Explanation:');
  console.log(explanation);
}

export async function optimizeCode(code: string, options: any) {
  console.log('⚡ AI Code Optimization');
  
  const ai = new AIGenerator({
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || 'demo-key'
  });

  await ai.initialize();

  const optimized = await ai.optimizeCode(code, options.language || 'typescript');
  
  console.log('\n🚀 Optimized code:');
  console.log('\n' + '='.repeat(50));
  console.log(optimized);
  console.log('='.repeat(50));
}
