module.exports = {
  apps: [
    {
      name: 'hq-backend',
      cwd: './server',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'hq-frontend',
      cwd: './client',
      script: 'node_modules/.bin/vite',
      args: 'preview --port 5173 --host',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
