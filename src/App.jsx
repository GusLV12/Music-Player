import { useState, useRef, useEffect } from 'react';
import ReactHowler from 'react-howler';
import { formatTime } from './utils/timeUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, ProgressBar, Container, Row, Col } from 'react-bootstrap';

export const App = () => {
  const [playerState, setPlayerState] = useState({
    audioSrc: [],
    fileNames: [],
    fileIndex: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 0.3,
    isMuted: false,
  });

  const playerRef = useRef(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const urls = files.map((file) => URL.createObjectURL(file));
      const fileNames = files.map((file) => file.name);
      setPlayerState((prev) => ({
        ...prev,
        audioSrc: [...prev.audioSrc, ...urls],
        fileNames: [...(prev.fileNames || []), ...fileNames],
        isPlaying: true,
      }));
    }
  };

  const playNextTrack = () => {
    setPlayerState((prev) => ({
      ...prev,
      fileIndex: (prev.fileIndex + 1) % prev.audioSrc.length,
      currentTime: 0,
      isPlaying: true,
    }));
  };

  const playPreviousTrack = () => {
    setPlayerState((prev) => ({
      ...prev,
      fileIndex: prev.fileIndex === 0 ? prev.audioSrc.length - 1 : prev.fileIndex - 1,
      currentTime: 0,
      isPlaying: true,
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerState.isPlaying && playerRef.current) {
        setPlayerState((prev) => ({
          ...prev,
          currentTime: playerRef.current.seek(),
          duration: playerRef.current.duration(),
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playerState.isPlaying]);

  const handleSeek = (event) => {
    const seekTime = parseFloat(event.target.value);
    setPlayerState((prev) => ({
      ...prev,
      currentTime: seekTime,
    }));
    playerRef.current.seek(seekTime);
  };

  const handleVolumeChange = (event) => {
    const volume = parseFloat(event.target.value);
    setPlayerState((prev) => ({
      ...prev,
      volume,
    }));
  };

  const handleMuteToggle = () => {
    setPlayerState((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  const handlePlaybackRateChange = (event) => {
    const playbackRate = parseFloat(event.target.value);
    setPlayerState((prev) => ({
      ...prev,
      playbackRate,
    }));
    playerRef.current.rate(playbackRate);
  };

  return (
    <Container className="bg-dark text-white p-4 rounded shadow min-vh-100">
      {/* Subida de Archivos */}
      <Row className="mb-4">
        <Col>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            multiple
            className="form-control"
          />
        </Col>
      </Row>

      {/* Reproductor */}
      {playerState.audioSrc.length > 0 && (
        <Row className="bg-secondary p-4 rounded shadow text-center">
          <ReactHowler
            src={playerState.audioSrc[playerState.fileIndex]}
            playing={playerState.isPlaying}
            ref={playerRef}
            rate={playerState.playbackRate}
            format={['mp3', 'aac']}
            volume={playerState.isMuted ? 0 : playerState.volume}
            onEnd={() => playNextTrack()}
          />

          {/* Nombre de la Canción */}
          <Col xs={12} className="mb-3">
            <h5 className="text-white">
              {playerState.fileNames[playerState.fileIndex] || 'No Track Selected'}
            </h5>
          </Col>

          {/* Controles */}
          <Col xs={12} className="d-flex justify-content-center align-items-center my-3">
            <Button
              variant="outline-light"
              className="mx-2"
              onClick={playPreviousTrack}
              style={{ backgroundColor: '#107C10' }}
            >
              <i className="bi bi-skip-start-fill"></i>
            </Button>
            <Button
              className="mx-2"
              onClick={() =>
                setPlayerState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
              }
              style={{ backgroundColor: '#107C10', border: 'none' }}
            >
              {playerState.isPlaying ? (
                <i className="bi bi-pause-fill"></i>
              ) : (
                <i className="bi bi-play-fill"></i>
              )}
            </Button>
            <Button
              variant="outline-light"
              className="mx-2"
              onClick={playNextTrack}
              style={{ backgroundColor: '#107C10' }}
            >
              <i className="bi bi-skip-end-fill"></i>
            </Button>
          </Col>

          {/* Barra de Progreso */}
          <Col xs={12}>
            <ProgressBar
              now={(playerState.currentTime / playerState.duration) * 100}
              className="bg-dark"
              variant="success"
            />
            <input
              type="range"
              min="0"
              max={playerState.duration}
              step="0.01"
              value={playerState.currentTime}
              onChange={handleSeek}
              className="form-range mt-3"
            />
          </Col>

          {/* Volumen y Mute */}
          <Col xs={12} className="mt-3 d-flex justify-content-center align-items-center flex-column">
            <label className="form-label">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={playerState.volume}
              onChange={handleVolumeChange}
              className="form-range"
            />
            <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
              <Button
                onClick={handleMuteToggle}
                style={{
                  backgroundColor: '#107C10',
                  border: 'none',
                  width: '80px', // Ajusta el tamaño del botón
                  textAlign: 'center',
                }}
              >
                {playerState.isMuted ? 'Unmute' : 'Mute'}
              </Button>

              {/* Select Estilizado del Tamaño de Mute */}
              <select
                value={playerState.playbackRate}
                onChange={handlePlaybackRateChange}
                className="form-select"
                style={{
                  backgroundColor: '#107C10',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.25rem',
                  width: '80px', // Igual que el botón Mute
                  textAlign: 'center',
                }}
              >
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
          </Col>

          {/* Detalles de la pista */}
          <Col xs={12} className="mt-3">
            <div>
              {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
            </div>
          </Col>
        </Row>
      )}

      {/* Lista de Pistas */}
      <Row className="mt-5">
        <Col>
          <h5>Playlist</h5>
          {playerState.fileNames.map((name, index) => (
            <Row
              key={index}
              className="bg-dark text-white p-2 my-1 rounded d-flex justify-content-between align-items-center"
            >
              <Col>
                <span>{name}</span>
              </Col>
              <Col>
                <Button
                  size="sm"
                  onClick={() =>
                    setPlayerState((prev) => ({
                      ...prev,
                      fileIndex: index,
                      isPlaying: true,
                      currentTime: 0,
                    }))
                  }
                  style={{ backgroundColor: '#107C10', border: 'none' }}
                >
                  Play
                </Button>
              </Col>
            </Row>
          ))}
        </Col>
      </Row>
    </Container>
  );
};
