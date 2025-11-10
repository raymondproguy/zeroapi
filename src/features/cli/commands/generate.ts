/**
 * Generate code features
 */

import { AIGenerator } from '../../src/features/ai/ai-generator.js';

export async function generateFeature(featureType: string, name: string, options: any) {
  console.log(`🔧 Generating ${featureType}: ${name}`);
  
  const ai = new AIGenerator({
    provider: 'openai', 
    apiKey: process.env.OPENAI_API_KEY || 'demo-key'
  });

  await ai.initialize();

  let prompt = options.prompt || `${featureType} for ${name}`;
  
  console.log(`🤖 AI Generating: ${prompt}`);
  
  const result = await ai.generateFeature(prompt);
  
  if (result.success && result.code) {
    console.log('📝 Generated code:');
    console.log('\n' + '='.repeat(50));
    console.log(result.code);
    console.log('='.repeat(50));
    
    if (result.explanation) {
      console.log('\n💡 Explanation:');
      console.log(result.explanation);
    }
  } else {
    console.error('❌ Generation failed:', result.error);
  }
}
