'use client';

import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

import { ActiveLink } from '@/components/ActiveLink';
import { ToggleMenuButton } from '@/components/ToggleMenuButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardHeader = (props: {
  menu: {
    href: string;
    label: string;
  }[];
}) => {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 max-sm:hidden"
        >
          <Image
            src="/logo.svg"
            alt="Little Haven Logo"
            width={36}
            height={36}
            priority
          />
          <span className="font-hand text-2xl text-community-purple transition">
            Little Haven
          </span>
        </Link>

        <svg
          className="ml-1 size-8 stroke-muted-foreground max-sm:hidden"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <path d="M17 5 7 19" />
        </svg>

        <nav className="ml-3 max-lg:hidden">
          <ul className="flex flex-row items-center gap-x-3 text-lg font-medium [&_a:hover]:opacity-100 [&_a]:opacity-75">
            {props.menu.map((item) => (
              <li key={item.href}>
                <ActiveLink href={item.href}>{item.label}</ActiveLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-x-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToggleMenuButton />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {props.menu.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild>
              <Link href="/dashboard/circle-profile">Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* <li>
          <LocaleSwitcher />
        </li> */}

        <UserButton
          userProfileMode="navigation"
          userProfileUrl="/dashboard/user-profile"
          afterSignOutUrl="/"
          appearance={{
            elements: {
              rootBox: 'px-2 py-1.5',
            },
          }}
        />
      </div>
    </div>
  );
};

export { DashboardHeader };
