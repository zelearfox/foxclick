import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io();

function App() {
  const [status, setStatus] = useState('loading');
  const telegramLoginRef = useRef(null);
  const [count, setCount] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [foxEmojis, setFoxEmojis] = useState([]);
  const prevCountRef = useRef(count);

  document.addEventListener('keydown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }, true);

 const telegramAuthHandler = (user) => {
  console.log(user);
 };

  useEffect(() => {
    if (status != 'auth') return;

    window.onTelegramAuth = (user) => telegramAuthHandler(user);

    const scriptElement = document.createElement('script');
    scriptElement.async = true;
    scriptElement.src = 'https://telegram.org/js/telegram-widget.js?22';
    scriptElement.setAttribute('data-telegram-login', 'FoxClickTestBot');
    scriptElement.setAttribute('data-size', 'large');
    scriptElement.setAttribute('data-userpic', 'false');
    scriptElement.setAttribute('data-onauth', 'onTelegramAuth(user)');
    scriptElement.setAttribute('data-request-access', 'write');

    telegramLoginRef.current.appendChild(scriptElement);
  }, [status])

  useEffect(() => {
    if (count > prevCountRef.current) {
      const newFox = {
        id: Date.now() + Math.random(),
        offset: (Math.random() - 0.5) * 40
      };
      setFoxEmojis(prev => [...prev, newFox]);
    }
    prevCountRef.current = count;
  }, [count]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFoxEmojis(prev => prev.slice(1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [foxEmojis]);

  useEffect(() => {
    socket.on('connect', () => setStatus('ready'));
    socket.on('update', setCount);
    socket.on('autoclicker', () => setStatus('autoclicker'));
    
    return () => {
      socket.off('update');
    };
  }, []);

  const handleClick = () => socket.emit('click');

  return (
    <div className='flex flex-col items-center justify-center w-full h-[100svh]' onContextMenu={(e) => e.preventDefault()}>
      <style>{`
        @keyframes foxFlight {
          0% { 
            opacity: 1; 
            transform: translate(-50%, -35px); 
          }
          100% { 
            opacity: 0; 
            transform: translate(-50%, -135px); 
          }
        }
        .fox-emoji {
          animation: foxFlight 1.2s ease-out forwards;
          position: absolute;
          left: 50%;
          font-size: 3.5svh;
          pointer-events: none;
        }
      `}</style>

      {(() => {
        switch (status) {
          case 'loading':
            return (<h1>Загрузка...</h1>);
          
          case 'autoclicker':
            return (<h1 className='text-center text-red-500 font-bold'>Вы подозреваетесь в использовании автокликера!</h1>);
          
          case 'banned':
            return null;

          case 'auth':
            return (
              <div className="flex flex-col items-center justify-center">
                <div ref={telegramLoginRef} />
              </div>
            );
          
          case 'ready':
            return (
              <div className="flex flex-col gap-20 items-center">
                <div className="relative">
                  <h1 className='flex items-center gap-3 text-[3.5svh] font-bold'>
                    <span>Накликано лисов:</span>
                    <span className='text-orange-500 relative pr-2'>
                      {count}
                      {foxEmojis.map(fox => (
                        <span 
                          key={fox.id} 
                          className="fox-emoji" 
                          style={{ left: `calc(50% + ${fox.offset}px)` }}
                        >
                          🦊
                        </span>
                      ))}
                    </span>
                  </h1>
                </div>

                <button
                  className={`bg-orange-500 h-[30svh] w-[30svh] rounded-full flex items-center 
                    justify-center text-[6svh] font-bold cursor-pointer transition-transform 
                    duration-100 ${isPressed ? 'scale-95' : ''}`}
                  onClick={handleClick}
                  onMouseDown={() => setIsPressed(true)}
                  onMouseUp={() => setIsPressed(false)}
                  onMouseLeave={() => setIsPressed(false)}
                >
                  КЛИК
                </button>
              </div>
            )

          default:
            return null;
        }
      })()}
    </div>
  );
}

export default App;