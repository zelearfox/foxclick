import { lazy, StrictMode, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { crashBrowser } from 'devtools-detector';
import useIsDevToolsOpen from 'react-devtools-detector';
import App from './App';

function DETECT({ children }) {
  const isDetected = useIsDevToolsOpen({
    enabled: true
  });
  if (isDetected) {
    crashBrowser();
    window.location.href = 'about:blank';
  };
  useEffect(() => {
    if (isDetected) {
      crashBrowser();
      window.location.href = 'about:blank';
    };
  }, [isDetected]);
  return children;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DETECT>
      <App />
    </DETECT>
  </StrictMode>,
)
