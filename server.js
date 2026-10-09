const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8081;
// Distribution directory
const DIST_DIR = path.join(__dirname, 'dist');
// Source assets directory
const ASSETS_DIR = path.join(__dirname, 'frontend', 'assets');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function serveFile(filePath, req, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Support range requests for video streaming (intro.mp4)
  if (ext === '.mp4') {
    fs.stat(filePath, (statErr, videoStats) => {
      if (statErr) {
        res.writeHead(404);
        return res.end('Not found');
      }

      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : videoStats.size - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${videoStats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        });
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': videoStats.size,
          'Content-Type': 'video/mp4',
        });
        fs.createReadStream(filePath).pipe(res);
      }
    });
    return;
  }

  fs.readFile(filePath, (readErr, content) => {
    if (readErr) {
      res.writeHead(500);
      return res.end('Internal Server Error');
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Route to assets directory if matching /assets/ or /images/
  if (urlPath.includes('/assets/images/') || urlPath.includes('/images/')) {
    const filename = path.basename(urlPath);
    const candidatePath = path.join(ASSETS_DIR, 'images', filename);
    if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      return serveFile(candidatePath, req, res);
    }
  }

  // Try DIST_DIR
  let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

  if (!filePath.startsWith(DIST_DIR)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }
    serveFile(filePath, req, res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n======================================================`);
  console.log(`  MaybeWe is running at: ${url}`);
  console.log(`  Opening browser automatically...`);
  console.log(`  Keep this window open while using the app.`);
  console.log(`======================================================\n`);

  try {
    exec(`start ${url}`);
  } catch (e) {
    // ignore
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\nPort ${PORT} is active and serving.`);
  } else {
    console.error('Server error:', err);
  }
});
