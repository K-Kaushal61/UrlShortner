import rateLimit from 'express-rate-limit';
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

app.use(cors());
app.use(express.json());

app.set('trust proxy', 1);

const shortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Aapne bahut zyada URLs bana liye hain. Kripya 15 minute baad try karein.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/shorten', shortenLimiter, async (req, res) => {
  try {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: 'Long URL is required' });
    }

    try {
      const parsedUrl = new URL(longUrl);

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are allowed' });
      }
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const shortCode = nanoid(6);

    const newUrl = await prisma.url.create({
      data: {
        longUrl,
        shortCode,
      },
    });

    const shortUrl = `https://urlshortner-wdu6.onrender.com/${newUrl.shortCode}`;
    return res.status(201).json({ shortUrl, originalUrl: newUrl.longUrl });
  } catch (error) {
    console.error('Error shortening URL:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

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