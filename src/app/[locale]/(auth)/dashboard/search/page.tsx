'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Circle } from '@/features/circle/types';

export default function SearchPage() {
  const { user } = useUser();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [joinedCircles, setJoinedCircles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const response = await fetch('/api/circles?isPublic=true');
        const data = await response.json();
        setCircles(Array.isArray(data) ? data : []);
      } catch (error) {
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
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredCircles = circles.filter((circle) =>
    circle.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto p-4">
      {loading && <Loader />}
      <h1 className="mb-6 text-2xl font-bold">Search Circles</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6 w-full rounded-lg border p-2"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCircles.map((circle) => (
          <div
            key={circle.circleId}
            className="flex items-center rounded-lg border bg-white p-4 shadow-sm"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Image
                    src={
                      circle.iconUrl ||
                      '/assets/images/default-circle-icon-removebg.png'
                    }
                    alt={circle.name}
                    width={50}
                    height={50}
                    className="mr-4 rounded-full"
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
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
            >
              {joinedCircles.has(circle.circleId) ? 'Joined' : 'Join'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
