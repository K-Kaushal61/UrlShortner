import { useState } from 'react';

export default function ResultCard({ shortUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Browser ki Clipboard API se text copy karein
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    
    // 2 second baad wapas normal state mein le aayein
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!shortUrl) return null; // Agar URL nahi hai toh kuch render mat karo

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-col items-center space-y-3 transition-all">
      <span className="text-sm text-blue-800 font-medium">Aapka short link tayar hai:</span>
      <a 
        href={shortUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-lg text-blue-600 font-bold hover:underline"
      >
        {shortUrl}
      </a>
      <button 
        onClick={handleCopy}
        className={`w-full sm:w-auto px-6 py-2 rounded font-medium text-sm transition-colors ${
          copied 
            ? 'bg-green-500 text-white border-green-500' 
            : 'bg-white border border-blue-300 text-blue-600 hover:bg-blue-50'
        }`}
      >
        {copied ? 'Copied! ✓' : 'Copy Link'}
      </button>
    </div>
  );
}