import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const MAX_CLICKS_PER_SECOND = 14;

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
  const clickTimestamps = [];
  let isBanned = false;

  socket.emit('update', totalClicks);

  socket.on('click', () => {
    if (isBanned) return;

    totalClicks++;
    io.emit('update', totalClicks);

    const now = Date.now();
    clickTimestamps.push(now);

    while (clickTimestamps.length > 0 && now - clickTimestamps[0] > 1000) {
      clickTimestamps.shift();
    }

    if (clickTimestamps.length > MAX_CLICKS_PER_SECOND) {
      isBanned = true;
      socket.emit('autoclicker', 1);
      setTimeout(() => socket.disconnect(true), 100);
    }
  });
});

process.on('SIGINT', () => {
  clearInterval(saveInterval);
  saveClicks();
  process.exit();
});

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});