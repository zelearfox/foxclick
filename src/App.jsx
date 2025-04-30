import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io();

function App() {
  const [isLoading, setLoading] = useState(true);
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

  debugger;

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
    debugger;
    socket.on('connect', () => setLoading(false));
    socket.on('update', setCount);
    
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

      {isLoading ? (
        <h1>Загрузка...</h1>
      ) : (
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
      )}
    </div>
  );
}

export default App;