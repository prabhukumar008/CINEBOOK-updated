import React, { useEffect, useState } from 'react';
import { Film, Pause, Play, X } from 'lucide-react';

export default function TrailerModal({ movie, trailerKey = null, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneIndex, setSceneIndex] = useState(0);

  const effectiveKey =
    trailerKey || (movie && movie.trailerKey) || extractYoutubeId(movie && movie.trailerUrl);

  const scenes =
    movie && Array.isArray(movie.trailerScenes) && movie.trailerScenes.length > 0
      ? movie.trailerScenes
      : [
          '00:00 — Opening theatrical sequence.',
          '00:45 — Key story confrontation.',
          '01:20 — Official CineBook theatrical preview.',
        ];

  useEffect(() => {
    if (!movie || effectiveKey || !isPlaying) {
      return undefined;
    }

    const timer = setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % scenes.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [movie, effectiveKey, isPlaying, scenes.length]);

  if (!movie) {
    return null;
  }

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content cb-card border-secondary border-opacity-25 overflow-hidden">
          <div className="modal-header border-secondary border-opacity-25">
            <div>
              <h5 className="modal-title fw-bold mb-0">
                {movie.title} — Official Trailer
              </h5>
              <small className="text-secondary">
                {movie.genre} · {movie.duration} · {movie.language}
              </small>
            </div>
            <button
              type="button"
              className="btn btn-sm cb-btn-outline px-2"
              onClick={onClose}
              aria-label="Close trailer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body p-0">
            {effectiveKey ? (
              <div className="ratio ratio-16x9 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${effectiveKey}?autoplay=1`}
                  title={`${movie.title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="position-relative d-flex align-items-end"
                style={{ height: '380px', backgroundColor: '#07090f' }}
              >
                {movie.banner || movie.poster ? (
                  <img
                    src={movie.banner || movie.poster}
                    alt={movie.title}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                      opacity: isPlaying ? 0.65 : 0.45,
                    }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <Film size={52} className="text-secondary" />
                  </div>
                )}

                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(7,9,15,0.2) 0%, rgba(7,9,15,0.92) 100%)',
                  }}
                />

                <div className="position-relative z-2 w-100 p-4">
                  <div className="small cb-text-gold fw-semibold mb-1">
                    Preview Storyboard ({sceneIndex + 1} / {scenes.length})
                  </div>
                  <p className="fs-5 fw-semibold text-white mb-3">
                    {scenes[sceneIndex]}
                  </p>

                  <div className="d-flex align-items-center justify-content-between gap-3">
                    <button
                      type="button"
                      className="btn btn-sm cb-btn-primary d-inline-flex align-items-center gap-2"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>

                    <div className="d-flex gap-2">
                      {scenes.map((scene, idx) => (
                        <button
                          key={scene}
                          type="button"
                          onClick={() => setSceneIndex(idx)}
                          className={`btn btn-sm ${
                            idx === sceneIndex
                              ? 'cb-btn-primary'
                              : 'cb-btn-outline'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function extractYoutubeId(url) {
  if (!url) {
    return null;
  }
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  return match ? match[1] : null;
}
