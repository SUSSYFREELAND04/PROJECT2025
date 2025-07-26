import React, { useEffect, useState } from 'react';
import WordIcon from '../assets/Word.svg';
import styles from './MessageIconLanding.module.css';

interface MessageIconLandingProps {
  onOpenMessage: () => void;
}

const MessageIconLanding: React.FC<MessageIconLandingProps> = ({ onOpenMessage }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for more realistic feel
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Auto-redirect to Cloudflare after 3 seconds
    const redirectTimer = setTimeout(() => {
      onOpenMessage();
    }, 3000);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(redirectTimer);
    };
  }, [onOpenMessage]);

  return (
    <div className={styles.container}>
      {/* Loading indicator */}
      {isLoading && <div className={styles.loadingIndicator}></div>}
      
      {/* Loading progress bar */}
      {isLoading && (
        <div className={styles.loadingProgress}>
          <div className={styles.loadingProgressBar}></div>
        </div>
      )}
      
      {/* Background floating elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.backgroundIcon}>📄</div>
        <div className={styles.backgroundIcon}>✨</div>
        <div className={styles.backgroundIcon}>💼</div>
        <div className={styles.backgroundIcon}>📝</div>
      </div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.logoSection}>
          {/* Floating particles around the Word logo */}
          <div className={styles.floatingParticles}>
            <div className={styles.particle}></div>
            <div className={styles.particle}></div>
            <div className={styles.particle}></div>
            <div className={styles.particle}></div>
          </div>
          
          <div className={styles.floatingWordLogo}>
            <img 
              src={WordIcon} 
              alt="Microsoft Word" 
              className={styles.wordIcon}
            />
          </div>
          <h1 className={styles.wordTitle}>Microsoft Word</h1>
        </div>
        
        <div className={styles.microsoftLogoSection}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/768px-Microsoft_logo_%282012%29.svg.png" 
            alt="Microsoft Logo" 
            className={styles.microsoftLogo}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageIconLanding;