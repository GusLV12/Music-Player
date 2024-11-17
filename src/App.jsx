import { useState, useRef, useEffect } from 'react';
import ReactHowler from 'react-howler';

export const App = () => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null); // Referencia a ReactHowler

  // Cargar archivo y obtener duración
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioSrc(url);
      setIsPlaying(true);
    }
  };

  // Actualizar la posición actual de la música
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && playerRef.current) {
        setCurrentTime(playerRef.current.seek());
        setDuration(playerRef.current.duration());
      }
    }, 1000); // Actualiza cada segundo

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Cambiar la posición actual de reproducción al mover la barra
  const handleSeek = (event) => {
    const seekTime = parseFloat(event.target.value);
    setCurrentTime(seekTime);
    playerRef.current.seek(seekTime);
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      {audioSrc && (
        <ReactHowler
          src={audioSrc}
          playing={isPlaying}
          ref={playerRef}
          format={['mp3']}
          onEnd={() => setIsPlaying(false)}
        />
      )}
      
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Barra de progreso */}
      <input
        type="range"
        min="0"
        max={duration}
        step="0.01"
        value={currentTime}
        onChange={handleSeek}
      />

      {/* Muestra el tiempo actual y la duración */}
      <div>
        {Math.floor(currentTime)} / {Math.floor(duration)} segundos
      </div>
    </div>
  );
};