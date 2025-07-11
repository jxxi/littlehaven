'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import BrandLoader from '@/components/BrandLoader';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Circle } from '@/features/circle/types';
import { logError } from '@/utils/Logger';

export default function SearchPage() {
  const { user } = useUser();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [joinedCircles, setJoinedCircles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/circles?isPublic=true');
        const data = await response.json();
        setCircles(Array.isArray(data) ? data : []);
      } catch (error) {
        logError('Error in search page - fetchCircles', error);
        setCircles([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchJoinedCircles = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/circles?userId=${user.id}`);
        const data = await response.json();
        const joinedCircleIds = new Set<string>(
          data.map((circle: Circle) => circle.circleId),
        );
        setJoinedCircles(joinedCircleIds);
      } catch (error) {
        logError('Error in search page - fetchJoinedCircles', error);
        setJoinedCircles(new Set());
      }
    };

    fetchCircles();
    fetchJoinedCircles();
  }, [user]);

  const handleJoinCircle = async (circleId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/circles/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          circleId,
          userId: user.id,
          nickname: user.username || 'Anonymous',
        }),
      });

      if (response.ok) {
        setJoinedCircles((prev) => new Set([...prev, circleId]));
      }
    } catch (error) {
      logError('Error in search page - handleJoinCircle', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredCircles = circles.filter((circle) =>
    circle.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto flex h-[80vh] min-h-[600px] w-full max-w-[1600px] flex-col justify-start rounded-2xl bg-cream p-8 shadow-2xl">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6 w-full rounded-lg border p-2 caret-transparent"
      />
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <BrandLoader />
        </div>
      )}
      {filteredCircles.length === 0 && !loading ? (
        <div className="flex flex-1 items-center justify-center text-2xl text-gray-400">
          <h2 className="font-semibold">No results</h2>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCircles.map((circle) => (
            <div
              key={circle.circleId}
              className="flex min-h-[96px] items-center rounded-lg border bg-white p-4 shadow-sm"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Image
                      src={circle.iconUrl || '/lettermark.svg'}
                      alt={circle.name}
                      width={50}
                      height={50}
                      className="mr-4 rounded-full opacity-85"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="z-[100]">
                    <p>{circle.description || circle.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="grow">
                <h2 className="font-semibold">{circle.name}</h2>
                <p className="text-sm text-gray-600">{circle.description}</p>
              </div>
              <Button
                onClick={() => handleJoinCircle(circle.circleId)}
                disabled={joinedCircles.has(circle.circleId) || loading}
                className={`${
                  joinedCircles.has(circle.circleId)
                    ? 'bg-gray-300 text-gray-600'
                    : 'bg-community-purple text-white hover:bg-community-purple/80'
                }`}
              >
                {joinedCircles.has(circle.circleId) ? 'Joined' : 'Join'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
