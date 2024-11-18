import { useState, useRef, useEffect } from 'react';
import ReactHowler from 'react-howler';
import { formatTime } from './utils/timeUtils';

export const App = () => {
  const [playerState, setPlayerState] = useState({
    audioSrc: [],
    fileIndex: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 0.3, 
    isMuted: false
  });

  const playerRef = useRef(null);

  const onHandlerPlay = (e) => {
    const { name, value } = e.target;
    setPlayerState((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const urls = files.map(file => URL.createObjectURL(file));
      setPlayerState((prev) => ({
        ...prev,
        audioSrc: [...prev.audioSrc, ...urls],
        isPlaying: true,
      }));
    }
  };

  const playNextTrack = () => {
    setPlayerState((prev) => ({
      ...prev,
      fileIndex: (prev.fileIndex + 1) % prev.audioSrc.length,
      currentTime: 0,
      isPlaying: true
    }));
  };

  const playPreviousTrack = () => {
    setPlayerState((prev) => ({
      ...prev,
      fileIndex: prev.fileIndex === 0 ? prev.audioSrc.length - 1 : prev.fileIndex - 1,
      currentTime: 0,
      isPlaying: true
    }));
  };

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

  const handleSeek = (event) => {
    const seekTime = parseFloat(event.target.value);
    setPlayerState((prev) => ({
      ...prev,
      currentTime: seekTime
    }));
    playerRef.current.seek(seekTime);
  };

  const skipForward = () => {
    const newTime = Math.min(playerState.currentTime + 10, playerState.duration);
    setPlayerState((prev) => ({
      ...prev,
      currentTime: newTime
    }));
    playerRef.current.seek(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(playerState.currentTime - 10, 0);
    setPlayerState((prev) => ({
      ...prev,
      currentTime: newTime
    }));
    playerRef.current.seek(newTime);
  };

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
      <input type="file" accept="audio/*" onChange={handleFileChange} multiple />
      {playerState.audioSrc.length > 0 && (
        <ReactHowler
          src={playerState.audioSrc[playerState.fileIndex]}
          playing={playerState.isPlaying}
          ref={playerRef}
          rate={playerState.playbackRate}
          format={['mp3', 'aac']}
          volume={playerState.isMuted ? 0 : playerState.volume}
          onEnd={() => playNextTrack()}
        />
      )}
      
      <button onClick={() => setPlayerState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}>
        {playerState.isPlaying ? 'Pause' : 'Play'}
      </button>

      <button onClick={skipBackward}>-10s</button>
      <button onClick={skipForward}>+10s</button>

      <select name="velocity" id="velocity" onChange={handleVelocityChange} value={playerState.playbackRate}>
        <option value="0.5">0.5x</option>
        <option value="1">1x</option>
        <option value="1.25">1.25x</option>
        <option value="1.5">1.5x</option>
        <option value="2">2x</option>
      </select>

      <input
        type="range"
        min="0"
        max={playerState.duration}
        step="0.01"
        value={playerState.currentTime}
        onChange={handleSeek}
      />

      <button onClick={playNextTrack}>Next</button>
      <button onClick={playPreviousTrack}>Previous</button>

      <button onClick={() => setPlayerState((prev) => ({ ...prev, isMuted: !prev.isMuted }))}>
        {playerState.isMuted ? 'Unmute' : 'Mute'}
      </button>

      <div>
        {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)} min.
      </div>

      <input
        name="volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={playerState.volume}
        onChange={onHandlerPlay}
      />

      <div>
        {
          playerState.audioSrc.map((src, index) => (
            <div key={index}>
              <span>{src}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
};
