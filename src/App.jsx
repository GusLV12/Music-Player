import { useState, useRef, useEffect } from 'react';
import ReactHowler from 'react-howler';
import { formatTime } from './utils/timeUtils';

export const App = () => {
  const [playerState, setPlayerState] = useState({
    audioSrc: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 0.3, 
    isMuted: false
  });

  const playerRef = useRef(null); 

  // Cambiar Estado de Reproducción
  const onHandlerPlay = (e) => {
    const {name, value} = e.target;
    console.log('name: ', name, 'value: ', value);
    setPlayerState((prev) => ({ ...prev, [name]: value }));
  }

  // Cargar archivo y obtener duración
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPlayerState((prev) => ({
        ...prev,
        audioSrc: url,
        isPlaying: true
      }));
    }
  };

  // Actualizar la posición actual de la música
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerState.isPlaying && playerRef.current) {
        setPlayerState((prev) => ({
          ...prev,
          currentTime: playerRef.current.seek(),
          duration: playerRef.current.duration()
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playerState.isPlaying]);

  // Cambiar la posición actual de reproducción al mover la barra
  const handleSeek = (event) => {
    const seekTime = parseFloat(event.target.value);
    setPlayerState((prev) => ({
      ...prev,
      currentTime: seekTime
    }));
    playerRef.current.seek(seekTime);
  };

  // Función para adelantar 10 segundos
  const skipForward = () => {
    const newTime = Math.min(playerState.currentTime + 10, playerState.duration);
    setPlayerState((prev) => ({
      ...prev,
      currentTime: newTime
    }));
    playerRef.current.seek(newTime);
  };

  // Función para retroceder 10 segundos
  const skipBackward = () => {
    const newTime = Math.max(playerState.currentTime - 10, 0);
    setPlayerState((prev) => ({
      ...prev,
      currentTime: newTime
    }));
    playerRef.current.seek(newTime);
  };

  // Cambiar la velocidad de reproducción
  const handleVelocityChange = (e) => {
    const playbackRate = parseFloat(e.target.value);
    setPlayerState((prev) => ({
      ...prev,
      playbackRate
    }));
    playerRef.current.rate(playbackRate);
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      {playerState.audioSrc && (
        <ReactHowler
          src={playerState.audioSrc}
          playing={playerState.isPlaying}
          ref={playerRef}
          rate={playerState.playbackRate}
          format={['mp3']}
          onEnd={() => setPlayerState((prev) => ({ ...prev, isPlaying: false }))}
          volume={playerState.volume}
        />
      )}
      
      <button onClick={() => setPlayerState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}>
        {playerState.isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Botones de adelantar y retroceder */}
      <button onClick={skipBackward}>-10s</button>
      <button onClick={skipForward}>+10s</button>

      {/* Selector de velocidad */}
      <select name="velocity" id="velocity" onChange={handleVelocityChange} value={playerState.playbackRate}>
        <option value="0.5">0.5x</option>
        <option value="1">1x</option>
        <option value="1.25">1.25x</option>
        <option value="1.5">1.5x</option>
        <option value="2">2x</option>
      </select>

      {/* Barra de progreso */}
      <input
        type="range"
        min="0"
        max={playerState.duration}
        step="0.01"
        value={playerState.currentTime}
        onChange={handleSeek}
      />

      {/* Muestra el tiempo actual y la duración */}
      <div>
        {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)} min.
      </div>

      <input name='volume' type="range" min="0" max="1" step="0.01" value={playerState.volume} onChange={onHandlerPlay}/>
    </div>
  );
};
