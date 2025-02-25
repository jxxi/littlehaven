import React from 'react';

const Loader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
    <div className="size-16 animate-spin rounded-full border-y-4 border-blue-500" />
  </div>
);

export default Loader;
