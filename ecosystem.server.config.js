module.exports = {
  apps: [
    {
      name: "poshagam-server",
      script: "./dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 8080, // тот порт, который использует сервер
      },
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1500",
    },
    {
      name: "poshagam-client",
      script: "npm",
      args: "run start",
      cwd: "/opt/poshagam-client",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
