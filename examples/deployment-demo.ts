/**
 * Deployment Feature Demo - One-Command Deployment
 */

import zeroapi from '../index.js';

const app = zeroapi()
  .configure({ appName: 'ZeroAPI Deployment Demo' })
  .database({ provider: 'sqlite' })
  .auth({ provider: 'jwt', secret: 'demo-secret' })
  .payments({ provider: 'stripe' })
  .deployment({ 
    provider: 'vercel',
    environment: 'production',
    buildCommand: 'npm run build',
    outputDirectory: 'dist'
  });

// Deployment management routes
app.post('/api/deploy/project', async (req, res) => {
  try {
    const { name, provider = 'vercel' } = req.body;
    
    const project = await req.context.deployment.createProject(name, { provider });
    
    res.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        url: project.url,
        status: project.status
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/deploy/quick', async (req, res) => {
  try {
    const { name, provider = 'vercel' } = req.body;
    
    const result = await req.context.deployment.quickDeploy(name, { provider });
    
    res.json({
      success: true,
      project: {
        id: result.project.id,
        name: result.project.name,
        url: result.project.url
      },
      deployment: {
        id: result.deployment.id,
        url: result.deployment.url,
        status: result.deployment.status
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/deploy/projects', async (req, res) => {
  try {
    const projects = await req.context.deployment.listProjects();
    
    res.json({
      success: true,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        url: p.url,
        status: p.status
      }))
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/deploy/environment', async (req, res) => {
  try {
    const { projectId, variables } = req.body;
    
    await req.context.deployment.setEnvironmentVariables(projectId, variables);
    
    res.json({
      success: true,
      message: 'Environment variables set successfully'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/deploy/logs/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    
    const logs = await req.context.deployment.getDeploymentLogs(deploymentId);
    
    res.json({
      success: true,
      logs
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/deploy/info', async (req, res) => {
  res.json({
    provider: req.context.deployment.getProviderName(),
    initialized: req.context.deployment.isInitialized(),
    supportedProviders: req.context.deployment.getSupportedProviders(),
    suggestedProvider: req.context.deployment.suggestProvider()
  });
});

// CLI-like deployment endpoint
app.post('/api/deploy', async (req, res) => {
  try {
    const { name, provider = 'vercel', envVars = {} } = req.body;
    
    // Create project
    const project = await req.context.deployment.createProject(name, { provider });
    
    // Set environment variables
    const variables = Object.entries(envVars).map(([key, value]) => ({
      key,
      value: value as string,
      type: key.toLowerCase().includes('secret') ? 'secret' : 'plain'
    }));
    
    if (variables.length > 0) {
      await req.context.deployment.setEnvironmentVariables(project.id, variables);
    }
    
    // Deploy
    const deployment = await req.context.deployment.deploy(project);
    
    res.json({
      success: true,
      message: '🚀 Deployment successful!',
      project: {
        id: project.id,
        name: project.name,
        url: project.url
      },
      deployment: {
        id: deployment.id,
        url: deployment.url,
        status: deployment.status
      },
      nextSteps: [
        `Your app is live at: ${deployment.url}`,
        'Set up custom domain in your deployment provider dashboard',
        'Monitor logs for any issues'
      ]
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 ZeroAPI Deployment Demo Running!');
  console.log('▲ Deployment Provider: Vercel (demo mode)');
  console.log('');
  console.log('📍 Deployment Endpoints:');
  console.log('   POST http://localhost:3000/api/deploy/project');
  console.log('   POST http://localhost:3000/api/deploy/quick');
  console.log('   POST http://localhost:3000/api/deploy');
  console.log('   GET  http://localhost:3000/api/deploy/projects');
  console.log('   POST http://localhost:3000/api/deploy/environment');
  console.log('   GET  http://localhost:3000/api/deploy/logs/:id');
  console.log('   GET  http://localhost:3000/api/deploy/info');
  console.log('');
  console.log('💡 Try:');
  console.log('   http POST http://localhost:3000/api/deploy/quick name=my-zeroapi-app');
  console.log('   http POST http://localhost:3000/api/deploy name=my-app provider=railway envVars:=\'{"DATABASE_URL":"postgresql://...","SECRET_KEY":"abc123"}\'');
  console.log('   http GET http://localhost:3000/api/deploy/info');
});
