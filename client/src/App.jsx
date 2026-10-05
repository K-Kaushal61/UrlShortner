import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Page ko refresh hone se rokenge
    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      // Backend API ko POST request bhej rahe hain
      const response = await axios.post('http://localhost:5000/api/shorten', { 
        longUrl: longUrl 
      });
      
      // Response se short URL nikal kar state mein save karenge
      setShortUrl(response.data.shortUrl);
    } catch (err) {
      console.error(err);
      setError('Kuch galat ho gaya. Kripya valid URL daalein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Simple URL Shortener</h1>
      
      <form onSubmit={handleSubmit} className="form">
        <input
          type="url"
          placeholder="Lamba URL yahan daalein (e.g., https://example.com)"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
          className="input-box"
        />
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {shortUrl && (
        <div className="result">
          <p>Aapka Short URL:</p>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;