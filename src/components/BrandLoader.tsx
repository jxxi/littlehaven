import React from 'react';

export default function BrandLoader() {
  return (
    <svg
      width={80}
      height={80}
      viewBox="0 0 100 100"
      className="mx-auto block"
      style={{ display: 'block' }}
    >
      <circle cx="40" cy="30" r="18" fill="url(#purple)">
        <animate
          attributeName="cy"
          values="30;26;30"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="70" cy="60" r="14" fill="url(#blue)">
        <animate
          attributeName="cx"
          values="70;74;70"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="30" cy="70" r="16" fill="url(#green)">
        <animate
          attributeName="cy"
          values="70;74;70"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="68" cy="32" r="10" fill="url(#orange)">
        <animate
          attributeName="cy"
          values="32;28;32"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>
      <defs>
        <linearGradient id="purple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id="green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}
