import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from '@prisma/client';
import { nanoid } from 'nanoid';

dotenv.config();

const { PrismaClient } = pkg;
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. POST /api/shorten - Long URL ko chota karne ke liye
app.post('/api/shorten', async (req, res) => {
  try {
    const { longUrl } = req.body;

    // 1. Basic Check (Khali toh nahi hai?)
    if (!longUrl) {
      return res.status(400).json({ error: 'Long URL is required' });
    }

    // 2. Strict URL Validation & Protocol Check (Security Fix)
    try {
      const parsedUrl = new URL(longUrl);
      
      // Sirf http:// aur https:// allow karein. (Taaki ftp:// ya javascript:// block ho jaye)
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are allowed' });
      }
    } catch (err) {
      // Agar 'new URL()' fail ho gaya, matlab format galat hai
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // 3. 6 characters ka ek unique short code generate karte hain
    const shortCode = nanoid(6);

    // 4. Database mein save karte hain
    const newUrl = await prisma.url.create({
      data: {
        longUrl,
        shortCode,
      },
    });


// 5. Client ko short URL bhejte hain
    const shortUrl = `https://urlshortner-client.vercel.app/${newUrl.shortCode}`;
    return res.status(201).json({ shortUrl, originalUrl: newUrl.longUrl });

  } catch (error) {
    console.error('Error shortening URL:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. GET /:shortCode - Short URL se redirect karne ke liye
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const urlEntry = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!urlEntry) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    return res.redirect(urlEntry.longUrl);

  } catch (error) {
    console.error('Error redirecting:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});