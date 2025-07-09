'use client';

import Link from 'next/link';

import { ToggleMenuButton } from '@/components/ToggleMenuButton';
import { useMenu } from '@/hooks/UseMenu';

const CenteredMenu = (props: {
  logo: React.ReactNode;
  children: React.ReactNode;
  rightMenu: React.ReactNode;
}) => {
  const { handleToggleMenu } = useMenu();

  return (
    <div className="relative w-full border-b bg-white">
      {/* Centered content: logo and nav only */}
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/">{props.logo}</Link>
        </div>
        {/* Center: Nav */}
        <nav className="flex flex-1 justify-center">
          <ul className="flex gap-x-6 gap-y-1 text-lg font-medium max-lg:flex-col [&_a:hover]:opacity-100 [&_a]:opacity-60 max-lg:[&_a]:inline-block max-lg:[&_a]:w-full">
            {props.children}
          </ul>
        </nav>
        {/* Mobile menu button */}
        <div className="absolute right-4 top-4 lg:hidden [&_button:hover]:opacity-100 [&_button]:opacity-60">
          <ToggleMenuButton onClick={handleToggleMenu} />
        </div>
      </div>
      {/* Right: Menu absolutely positioned, outside centering container */}
      <div className="absolute right-0 top-0 flex h-full items-center pr-4">
        <ul className="flex flex-row items-center gap-x-4 text-lg font-medium [&_li:not(:last-child):hover]:opacity-100 [&_li:not(:last-child)]:opacity-60">
          {props.rightMenu}
        </ul>
      </div>
    </div>
  );
};

export { CenteredMenu };
