const http = require("http");

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "Docker Web App";
const APP_ENV = process.env.APP_ENV || "development";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!DOCTYPE html>
<html>
<head>
  <title>${APP_NAME}</title>
</head>
<body>
  <h1>${APP_NAME}</h1>
  <p>Hello from Docker!</p>
  <p>Environment: ${APP_ENV}</p>
</body>
</html>`);
});

server.listen(PORT, () => {
  console.log(`${APP_NAME} is running on port ${PORT}`);
});
