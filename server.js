require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const { poolPromise } = require("./src/core/config/db");
const getLocalIp = require("./src/core/utils/get-local-ip");
const initSocket = require("./src/core/socket/socket");

const port = process.env.PORT || 5002;

(async () => {
  try {
    poolPromise.catch((err) => {
      console.error("DB connection failed:", err.message);
    });

    const server = http.createServer(app);
    initSocket(server);

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Stop the other process or change PORT.`);
        return;
      }

      console.error("HTTP server error:", error.message);
      process.exit(1);
    });

    server.listen(port, () => {
      const ip = getLocalIp();
      console.log("Server running:");
      console.log(`   Local:   http://localhost:${port}`);
      console.log(`   Network: http://${ip}:${port}`);
    });

    const shutdown = () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    console.error("Failed to initialize server:", err.message);
    process.exit(1);
  }
})();
