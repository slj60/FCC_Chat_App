import http from 'http';
import fs from 'fs';
import { WebSocketServer, WebSocket  } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
    fs.readFile("./public/index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading page");
      return;
    }
    res.writeHead(200, { "Content-Type": 'text/html' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server })

wss.on("connection", (socket, req) => {
    const username = new URL(req.url, "http://localhost").searchParams.get(
        "username",
    );
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ "type": "system", "text": `${username} joined` }));
      }
    });
    socket.on("message", (message) => {
        const { username, text } = JSON.parse(message);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ "type": "chat", username, text }));
            }
        });
    });
    socket.on("close", () => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ "type": "system", "text": `${username} left` }));
            }
        });
    });
})


server.listen(PORT, 'localhost', () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
