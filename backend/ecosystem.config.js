module.exports = {
  apps: [
    {
      name: 'yaqiin-backend',
      script: 'dist/app.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4433
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4433
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
