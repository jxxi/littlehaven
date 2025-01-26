import { Pause, Play } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface VideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

const Video = ({
  src,
  poster,
  className = '',
  autoPlay = false,
}: VideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedData = () => {
    setIsLoaded(true);
    if (autoPlay && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="group relative">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={`w-full rounded-lg ${className}`}
        onLoadedData={handleLoadedData}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        controls={false}
        playsInline
      >
        <track kind="captions" srcLang="en" src={`${src}.vtt`} />
      </video>
      {isLoaded && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? (
            <Pause className="size-12 text-white" />
          ) : (
            <Play className="size-12 text-white" />
          )}
        </button>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gray-200/20">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{
            width: `${
              videoRef.current
                ? (videoRef.current.currentTime / videoRef.current.duration) *
                  100
                : 0
            }%`,
          }}
        />
      </div>
    </div>
  );
};

export { Video };
