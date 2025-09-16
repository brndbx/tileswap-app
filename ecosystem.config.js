module.exports = {
  apps: [
    {
      name: 'nextjs',
      cwd: '/var/www/vhosts/gracious-boyd.217-154-3-148.plesk.page/nextjs',
      script: '.next/standalone/server.js',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3001',
      },
    },
  ],
};
