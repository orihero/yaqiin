module.exports = {
  apps: [
    {
      name: 'yaqiin-frontend',
      script: 'node_modules/vite/bin/vite.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      args: 'preview --port 5173 --host 0.0.0.0'
    }
  ]
};
