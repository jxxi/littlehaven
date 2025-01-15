import React from 'react';

const Channels = (props: {
  channels: Array<{ id: string; name: string }>; // Only keeping channels prop
}) => (
  <div className="flex h-full items-center justify-center rounded-md bg-card p-5">
    <div className="mt-3 text-center">
      {props.channels.map((channel) => (
        <div key={channel.id} className="p-2">
          {channel.name}
        </div>
      ))}
    </div>
  </div>
);

export { Channels };
