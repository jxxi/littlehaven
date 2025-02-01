import Image from 'next/image';

interface Circle {
  circleId: string;
  name: string;
  description?: string;
  icon?: string;
}

interface UserCircleListProps {
  circles: Circle[];
}

const UserCircleList = ({ circles }: UserCircleListProps) => {
  if (!circles || !Array.isArray(circles)) {
    return null;
  }

  return (
    <div className="rounded-md bg-card p-3">
      <div className="max-w-3xl space-y-2">
        {circles.map((circle) => (
          <div
            key={circle.circleId}
            className="flex cursor-pointer items-center rounded-md border p-3 hover:bg-accent"
          >
            <Image
              src={
                circle.icon ||
                '/src/components/ui/images/default-circle-icon.png'
              }
              alt=""
              width={32}
              height={32}
              className="mr-2"
            />
            <div>
              <div className="font-bold">{circle.name}</div>
              <div className="text-sm text-gray-500">{circle.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { UserCircleList };
