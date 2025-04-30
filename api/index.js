import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const CLICKS_FILE = path.join(process.cwd(), 'clicks.json');

let totalClicks = 0;
try {
  if (fs.existsSync(CLICKS_FILE)) {
    const data = fs.readFileSync(CLICKS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    totalClicks = parsed.totalClicks || 0;
  }
} catch (err) {
  console.error('Error loading clicks:', err);
}

function saveClicks() {
  try {
    const data = JSON.stringify({ totalClicks });
    fs.writeFileSync(CLICKS_FILE, data);
  } catch (err) {
    console.error('Error saving clicks:', err);
  }
}

const saveInterval = setInterval(saveClicks, 10000);

io.on('connection', (socket) => {
  socket.emit('update', totalClicks);
  
  socket.on('click', () => {
    totalClicks++;
    io.emit('update', totalClicks);
  });
});

process.on('SIGINT', () => {
  clearInterval(saveInterval);
  saveClicks();
  process.exit();
});

app.use(express.static('../dist'));

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '../dist/' })
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});