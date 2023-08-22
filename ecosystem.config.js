module.exports = {
  apps: [
    {
      name: "dent-cms-api",
      script: "npm start",
      args: ["--color"],
      env: {
        PORT: 1001,
        NODE_ENV: "prod",
        SERVER_ENV: "prod",
        DEBUG: "server:*",
        DEBUG_COLORS: true,
      },
    },
  ],
};
