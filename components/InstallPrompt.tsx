'use client';

import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if running in iOS standalone mode
    if (iOS && (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // For iOS, show prompt after delay if not dismissed
    if (iOS) {
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
        const now = Date.now();
        
        // Show again after 7 days
        if (!dismissed || (dismissedTime && now - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000)) {
          setShowPrompt(true);
        }
      }, 3000);
      return;
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show install prompt after 3 seconds
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
        const now = Date.now();
        
        // Show again after 7 days
        if (!dismissed || (dismissedTime && now - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000)) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
      localStorage.removeItem('pwa-install-dismissed-time');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-5 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="bg-white/20 rounded-lg p-3 flex-shrink-0">
          {isIOS ? <Share className="w-6 h-6" /> : <Download className="w-6 h-6" />}
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Install Clinical Calculator</h3>
          
          {isIOS ? (
            <>
              <p className="text-sm text-blue-100 mb-3">
                Install this app on your iPhone for offline access and better experience!
              </p>
              <div className="bg-white/10 rounded-md p-3 text-xs text-blue-50 mb-3 space-y-2">
                <p className="font-semibold">How to install on iOS:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Tap the Share button <Share className="w-3 h-3 inline" /> at the bottom</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                </ol>
              </div>
              <button
                onClick={handleDismiss}
                className="w-full bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-blue-50 transition-colors"
              >
                Got it!
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-blue-100 mb-4">
                Get instant access and use offline! Install the app for a better experience.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-blue-50 transition-colors"
                >
                  Install App
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 rounded-md font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-blue-100">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Works Offline
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Fast Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
