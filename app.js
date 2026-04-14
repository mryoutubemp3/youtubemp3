const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3033;

// Make sure you install `npm install mime-types` or handle MIME manually
const mime = require('mime-types');

app.use(express.json());

// Serve the 'public' folder for index.html, script.js, style.css, etc.
app.use(express.static('public'));

// Serve the 'downloads' folder at /downloads
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.post('/convert', async (req, res) => {
  const { url, bitrate } = req.body;
  if (!url) {
    return res.status(400).send("URL is required");
  }

  // The output template to create files using YouTube title.
  // e.g. "Amazing_Video_Title.mp3"
  const outputTemplate = path.join(__dirname, 'downloads', '%(title)s.%(ext)s');

  // Construct yt-dlp arguments
  const args = [
    url,
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', bitrate || '192K',
    '--output', outputTemplate,
    '--restrict-filenames',
    '--newline'
  ];

  try {
    // We'll spawn 'yt-dlp' manually so we can parse output lines and 
    // capture the final file name from "Destination: ...".
    const ytdlp = spawn('yt-dlp', args);

    let finalFileName = null;  // Will store "Amazing_Video_Title.mp3"
    
    ytdlp.stdout.on('data', (data) => {
      const line = data.toString().trim();
      // Example line: "Destination: /path/to/downloads/Amazing_Video_Title.mp3"
      const match = line.match(/Destination:\s*(.*)/i);
      if (match && match[1]) {
        const fullPath = match[1].trim(); // e.g. "/home/user/.../downloads/Amazing_Video_Title.mp3"
        finalFileName = path.basename(fullPath); 
        // e.g. "Amazing_Video_Title.mp3"
      }
      console.log(line);
    });

    ytdlp.stderr.on('data', (errData) => {
      console.error(errData.toString());
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        if (finalFileName) {
          // Return a direct link, e.g. /downloads/Amazing_Video_Title.mp3
          return res.json({
            filePath: `/downloads/${finalFileName}`,
            message: "Conversion successful!"
          });
        } else {
          // If we couldn't parse it, fallback to just /downloads
          return res.json({
            filePath: `/downloads`,
            message: "Conversion successful (filename unknown)"
          });
        }
      } else {
        return res.status(500).json({ message: "Conversion failed" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Conversion failed", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
