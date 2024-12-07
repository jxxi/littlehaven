const CircleList = () => (
  <div className="rounded-md bg-card p-5">
    <div className="max-w-3xl space-y-2">
      {['Welcome', 'Gamers', 'November 2023'].map((circle) => (
        <div
          key={circle}
          className="flex cursor-pointer items-center rounded-md border p-3 hover:bg-accent"
        >
          {circle}
        </div>
      ))}
    </div>
  </div>
);

export { CircleList };
