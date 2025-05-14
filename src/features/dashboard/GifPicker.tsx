import { Search } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import type { Gif, GifPickerProps } from './GifPickerProps';

const GifPicker = ({ onSelect, onClose }: GifPickerProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const searchGifs = async (query: string) => {
    try {
      const response = await fetch(
        `/api/gifs/search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setGifs(data.results);
    } catch (error) {
      /* empty */
    }
  };

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-12 right-0 z-50 w-96 rounded-md bg-gray-800 p-3 shadow-lg"
    >
      <div className="mb-3 flex items-center rounded-md bg-gray-700 p-2">
        <Search className="mr-2 size-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            searchGifs(e.target.value);
          }}
          placeholder="Search GIFs"
          className="w-full bg-transparent text-white focus:outline-none"
        />
      </div>

      <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto">
        {gifs?.map((gif) => (
          <div key={gif.id} className="aspect-square w-full">
            <button
              type="button"
              onClick={() => onSelect({ url: gif.url, preview: gif.preview })}
              className="relative size-full overflow-hidden rounded-md hover:opacity-80"
            >
              <Image
                src={gif.preview}
                alt="GIF"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export { GifPicker };
