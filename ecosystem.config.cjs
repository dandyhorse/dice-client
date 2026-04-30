module.exports = {
  apps: [
    {
      name: 'dice-client',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 5174',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: ['dist'],
      ignore_watch: ['node_modules'],
      max_memory_restart: '1G',
    },
  ],
};
