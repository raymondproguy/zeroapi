async function testEndpoint(url, needsAuth = false) {
    const resultEl = document.getElementById('result');
    resultEl.innerHTML = '🔄 Testing...';
    
    try {
        const options = needsAuth ? { 
            headers: { 'Authorization': 'demo-token' } 
        } : {};
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        resultEl.innerHTML = 
            `<strong>${url}:</strong><br><pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
        resultEl.innerHTML = 
            `<strong style="color: #ff6b6b">Error:</strong> ${error.message}`;
    }
}

function showFeature(feature) {
    const demoEl = document.getElementById('feature-demo');
    const examples = {
        // 🆕 ACTUAL FEATURES WE BUILT
        routing: `// 🚀 Routing (ACTUAL)\napp.get('/users/:id', (req, res) => {\n  res.json({ user: req.params.id });\n});\n\napp.post('/users', (req, res) => {\n  res.json({ created: true });\n});`,

        middleware: `// 🔌 Middleware (ACTUAL)\napp.use((req, res, next) => {\n  console.log(\`\${req.method} \${req.url}\`);\n  next();\n});\n\n// Route-specific middleware\napp.get('/profile', authMiddleware, handler);`,

        static: `// 📁 Static Serving (ACTUAL)\napp.static('website');\n// Serves: CSS, JS, HTML, Images\n// Visit: http://localhost:3000`,

        typescript: `// 🔒 TypeScript (ACTUAL)\nimport zeroapi from 'zeroapi';\nconst app = zeroapi();\n// Full type safety out of the box!`,

        cors: `// 🌐 CORS (ACTUAL)\n// Automatic CORS handling\n// No configuration needed\napp.get('/api/data', (req, res) => {\n  res.json({ works: 'with frontend!' });\n});`,

        validation: `// ✅ JSON Validation (ACTUAL)\n// Automatic JSON parsing for POST/PUT\napp.post('/users', (req, res) => {\n  // req.body is already parsed!\n  res.json({ received: req.body });\n});`
    };
    
    demoEl.textContent = examples[feature] || 'Select a feature to see actual code from our framework...';
}

// Test hello endpoint on page load
testEndpoint('/api/hello');
