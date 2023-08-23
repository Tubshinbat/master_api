module.exports = {
  apps: [
    {
      name: "master-cms-api",
      script: "npm start",
      args: ["--color"],
      env: {
        PORT: 1003,
        NODE_ENV: "prod",
        SERVER_ENV: "prod",
        DEBUG: "server:*",
        DEBUG_COLORS: true,
      },
    },
  ],
};
