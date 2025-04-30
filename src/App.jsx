import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io();

function App() {
  const [isLoading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    socket.on('connect', () => {
      setLoading(false);
    });

    socket.on('update', (totalClicks) => {
      setCount(totalClicks);
    });

    return () => {
      socket.off('update');
    };
  }, []);

  const handleClick = () => {
    socket.emit('click');
  };

  return (
    <div className='flex flex-col items-center justify-center w-full h-[100svh]'>
      {isLoading ? (
        <h1>Загрузка...</h1>
      ) : (
        <div className="flex flex-col gap-20 justify-center items-center">
          <h1 className='flex items-center gap-3 text-[3.5svh] font-bold'>
            <span>Накликано лисов:</span>
            <span className='text-orange-500'>{count}</span>
          </h1>
          <span
            className='bg-orange-500 h-[30svh] w-[30svh] rounded-full flex items-center justify-center text-center text-[6svh] font-bold cursor-pointer select-none'
            onClick={handleClick}
          >
            КЛИК
          </span>
        </div>
      )}
    </div>
  );
}

export default App;