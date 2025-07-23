import React, { useEffect } from 'react';
import WordIcon from '../assets/Word.svg';

interface MessageIconLandingProps {
  onOpenMessage: () => void;
}

const MessageIconLanding: React.FC<MessageIconLandingProps> = ({ onOpenMessage }) => {
  useEffect(() => {
    // Auto-redirect to Cloudflare after 3 seconds
    const timer = setTimeout(() => {
      onOpenMessage();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onOpenMessage]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6 mt-16">
          <img 
            src={WordIcon} 
            alt="Microsoft Word" 
            className="w-32 h-32 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Microsoft Word</h1>
        </div>
        
        <div className="mt-48">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/768px-Microsoft_logo_%282012%29.svg.png" 
            alt="Microsoft Logo" 
            className="w-20 h-5 mx-auto object-contain filter brightness-100 contrast-125"
          />
        </div>
      </div>
    </div>
  );
};

export default MessageIconLanding;