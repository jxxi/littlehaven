import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TAG_METADATA } from '@/constants/tags';
import type { Circle } from '@/types/Circle';
import type { CircleMember } from '@/types/CircleMember';
import { logError } from '@/utils/Logger';

interface CircleSelectionModalProps {
  onSubmitSuccess?: () => void;
}

const CircleSelectionModal: React.FC<CircleSelectionModalProps> = ({
  onSubmitSuccess,
}) => {
  const { user } = useUser();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircles, setSelectedCircles] = useState<Circle[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredCircles = Array.isArray(circles)
    ? circles.filter((circle) =>
        circle.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // Sort circles to prioritize those with matching tags
  const sortedCircles = [...filteredCircles].sort((a, b) => {
    const aHasMatchingTags =
      a.tags?.some((tag) => selectedTags.includes(tag)) || false;
    const bHasMatchingTags =
      b.tags?.some((tag) => selectedTags.includes(tag)) || false;

    if (aHasMatchingTags && !bHasMatchingTags) return -1;
    if (!aHasMatchingTags && bHasMatchingTags) return 1;
    return 0;
  });

  // Helper function to check if a circle has matching tags
  const hasMatchingTags = (circle: Circle) => {
    return circle.tags?.some((tag) => selectedTags.includes(tag)) || false;
  };

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const response = await fetch('/api/circles?isPublic=true');
        const data = await response.json();
        setCircles(Array.isArray(data) ? data : []);
      } catch (error) {
        logError('Error in CircleSelectionModal feature', error);
        setCircles([]);
      }
    };

    fetchCircles();
  }, []);

  const handleNextPage = () => {
    setPage(2);
  };

  const handlePrevPage = () => {
    setPage(1);
  };

  const handleTagSelection = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleCheckboxChange = (circle: Circle) => {
    setSelectedCircles((prev) =>
      prev.some((c) => c.circleId === circle.circleId)
        ? prev.filter((c) => c.circleId !== circle.circleId)
        : [...prev, circle],
    );
  };

  const handleSubmit = async () => {
    try {
      const members: CircleMember[] = selectedCircles.map((circle) => ({
        circleId: circle.circleId,
        userId: user?.id || '',
        nickname: user?.username || 'Anonymous',
      }));

      const response = await fetch('/api/circles/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(members),
      });

      if (!response.ok) {
        throw new Error('Failed to create circle members');
      }

      const userResponse = await fetch('/api/circles/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || '',
          interests: selectedTags,
        }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to update user interests');
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      logError('Error in CircleSelectionModal feature', error);
    }
  };

  const skip = () => {
    router.push('/dashboard');
  };

  // Group tags by category
  const tagsByCategory = Object.entries(TAG_METADATA).reduce(
    (acc, [tag, { category }]) => {
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tag);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const renderPage = () => {
    switch (page) {
      case 1:
        return (
          <>
            <h2 className="mb-4 text-xl font-semibold">Welcome to Circles!</h2>
            <h2 className="mb-4 text-xl font-semibold">
              What are you interested in?
            </h2>
            <div className="mb-4 max-h-80 overflow-y-auto">
              {Object.entries(tagsByCategory).map(([category, tags]) => (
                <div key={category} className="mb-4">
                  <h3 className="mb-2 font-medium text-gray-700">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagSelection(tag)}
                        className={`rounded-full px-3 py-1 text-sm transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {tag.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={handlePrevPage}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Next
              </button>
            </div>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={skip}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                Skip for now
              </button>
            </div>
          </>
        );
      case 2:
      default:
        return (
          <>
            <h2 className="mb-4 text-xl font-semibold">Select Your Circles</h2>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4 w-full rounded border p-2"
            />
            {sortedCircles.length === 0 && (
              <div className="mb-4 text-center text-gray-500">
                No results found.
              </div>
            )}
            <div className="max-h-60 space-y-4 overflow-y-auto">
              {sortedCircles.map((circle) => (
                <div key={circle.circleId} className="flex items-center">
                  <input
                    type="checkbox"
                    id={circle.circleId}
                    checked={selectedCircles.some(
                      (member) => member.circleId === circle.circleId,
                    )}
                    onChange={() => handleCheckboxChange(circle)}
                    className="mr-2"
                  />
                  <div className="relative mr-2">
                    <Image
                      src={circle.icon ?? '/default-circle-icon.png'}
                      alt={circle.name}
                      width={40}
                      height={40}
                      className="size-10 rounded-full"
                    />
                    {hasMatchingTags(circle) && (
                      <span
                        className="absolute -right-1 -top-1 text-yellow-400"
                        title="Recommended based on your interests"
                      >
                        ★
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {circle.name}
                      {hasMatchingTags(circle) && (
                        <span
                          className="ml-1 text-yellow-400"
                          aria-hidden="true"
                        >
                          ★
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {circle.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={handlePrevPage}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Join!
              </button>
            </div>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={skip}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                Skip for now
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        {renderPage()}
      </div>
    </div>
  );
};

export default CircleSelectionModal;
