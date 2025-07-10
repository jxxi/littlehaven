// Shared landing/unauth layout components

'use client';

import React from 'react';

export const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-8">
    {children}
  </div>
);

export const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full max-w-[520px] flex-col items-center overflow-hidden rounded-2xl border border-white/20 bg-white/95 p-0 shadow-lg backdrop-blur-sm">
    {children}
  </div>
);

export const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full flex-col items-center px-10 py-14">
    {children}
  </div>
);

export const Hero = ({ children }: { children: React.ReactNode }) => (
  <section className="relative flex w-full flex-col items-center overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 py-10 pb-6">
    {children}
  </section>
);

export const HeroTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className="mb-2 text-center font-['Edu_NSW_ACT_Cursive'] text-[2.2rem] font-semibold tracking-tight text-white drop-shadow-lg">
    {children}
  </h1>
);

export const HeroTagline = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-center text-lg font-normal text-gray-100">{children}</h2>
);

export const HeroSubtitle = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <p
    className="mt-2 text-center text-sm font-medium tracking-wide text-gray-100/80"
    style={style}
  >
    {children}
  </p>
);

export const LogoContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mb-8 inline-block">{children}</div>
);

export const Logo = ({ children }: { children: React.ReactNode }) => (
  <div className="flex size-[120px] items-center justify-center rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-105">
    {children}
  </div>
);

export const CirclesIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="relative size-[100px] overflow-hidden">{children}</div>
);

const Circle = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`absolute rounded-full opacity-90 ${className}`}
    style={style}
  />
);

export const Circle1 = () => (
  <Circle
    className="size-8 bg-gradient-to-br from-indigo-500 to-purple-600"
    style={{
      top: '22px',
      left: '34px',
      animation: 'float 3s ease-in-out infinite',
    }}
  />
);
export const Circle2 = () => (
  <Circle
    className="size-6 bg-gradient-to-br from-cyan-500 to-cyan-700"
    style={{
      top: '54px',
      left: '60px',
      animation: 'float 3s ease-in-out infinite 0.5s',
    }}
  />
);
export const Circle3 = () => (
  <Circle
    className="size-7 bg-gradient-to-br from-emerald-500 to-emerald-700"
    style={{
      top: '60px',
      left: '18px',
      animation: 'float 3s ease-in-out infinite 1s',
    }}
  />
);
export const Circle4 = () => (
  <Circle
    className="size-5 bg-gradient-to-br from-amber-500 to-amber-600"
    style={{
      top: '30px',
      left: '65px',
      animation: 'float 3s ease-in-out infinite 1.5s',
    }}
  />
);

export const BackgroundChatMessages = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="pointer-events-none fixed inset-0 z-0 hidden md:block">
    {children}
  </div>
);

export const ChatMessage = ({
  top,
  left,
  width = '260px',
  children,
}: {
  top: string;
  left: string;
  width?: string;
  children: React.ReactNode;
}) => (
  <div
    className="pointer-events-none absolute z-10 hidden min-w-[320px] select-none rounded-2xl border border-gray-100 bg-white/35 px-5 py-4 text-base font-normal text-gray-700 shadow-lg backdrop-blur-sm md:block"
    style={{
      top: `calc(${top} + 8px)`,
      left: `calc(${left} + 8px)`,
      width,
      opacity: 0.35,
    }}
  >
    {children}
  </div>
);
