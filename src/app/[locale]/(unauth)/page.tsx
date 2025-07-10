'use client';

import { Waitlist } from '@clerk/nextjs';
import { useState } from 'react';

import {
  BackgroundChatMessages,
  Card,
  CardContent,
  ChatMessage,
  Circle1,
  Circle2,
  Circle3,
  Circle4,
  CirclesIcon,
  Hero,
  HeroSubtitle,
  HeroTagline,
  HeroTitle,
  Logo,
  LogoContainer,
  Wrapper,
} from '@/features/landing/LandingLayout';

const brand = {
  purple: '#6366f1',
  blue: '#06b6d4',
  green: '#1db981',
  orange: '#f59e0b',
  pink: '#ec4899',
  lavender: '#8b5cf6',
};

export default function IndexPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Wrapper>
      <Card>
        <Hero>
          <LogoContainer>
            <Logo>
              <CirclesIcon>
                <Circle1 />
                <Circle2 />
                <Circle3 />
                <Circle4 />
              </CirclesIcon>
            </Logo>
          </LogoContainer>
          <HeroTitle>Little Haven</HeroTitle>
          <HeroTagline>Where Parent Communities Thrive</HeroTagline>
        </Hero>
        <CardContent>
          <h2
            style={{
              color: 'black',
              fontWeight: 'semibold',
              fontSize: '1rem',
              marginBottom: '0.5rem',
              marginTop: '0.5rem',
            }}
          >
            Join the waitlist
          </h2>
          <HeroSubtitle style={{ color: brand.purple, marginBottom: '1.5rem' }}>
            Enter your email address and we&apos;ll let you know when your spot
            is ready
          </HeroSubtitle>
          <Waitlist
            appearance={{
              elements: {
                header: 'hidden',
                logo: 'hidden',
                button: 'bg-gradient-to-r from-indigo-500 to-purple-600',
                formButtonPrimary:
                  'bg-gradient-to-r from-indigo-500 to-purple-600',
                footerActionLink: `text-md font-semibold text-[${brand.purple}] hover:underline`,
                footerActionText: 'text-md',
                formFieldInput: 'text-md',
                formFieldLabel: 'text-md',
              },
            }}
          />

          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-xl">
                <h2 className="mb-2 text-xl font-bold text-community-purple">
                  You&apos;re on the waitlist!
                </h2>
                <p className="mb-4 text-gray-700">
                  Check your email for updates. Thank you for signing up!
                </p>
                <button
                  type="button"
                  className="mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 font-semibold text-white"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <BackgroundChatMessages>
        <ChatMessage top="5%" left="8%">
          <b>Sarah M.</b>
          <br />
          My 18-month-old just started walking! 🎉
        </ChatMessage>
        <ChatMessage top="20%" left="12%">
          <b>Rachel T.</b>
          <br />
          First pregnancy here &ndash; 28 weeks! When did you all start setting
          up the nursery?
        </ChatMessage>
        <ChatMessage top="38%" left="10%">
          <b>Emma L.</b>
          <br />
          Currently 32 weeks pregnant with my second. The tiredness is real! How
          do you manage with a toddler?
        </ChatMessage>
        <ChatMessage top="55%" left="15%">
          <b>Lisa H.</b>
          <br />
          Sleep regression at 15 months &ndash; please tell me this phase ends
          soon! 😅
        </ChatMessage>
        <ChatMessage top="75%" left="8%">
          <b>David K.</b>
          <br />
          Our 2-year-old refuses to eat vegetables. Anyone have creative ideas
          that actually work?
        </ChatMessage>
        <ChatMessage top="12%" left="75%">
          <b>Millie D.</b>
          <br />
          Congratulations! Cabinet locks and outlet covers are must-haves. Also
          watch those sharp corners!
        </ChatMessage>
        <ChatMessage top="28%" left="78%">
          <b>Tom W.</b>
          <br />
          We started around 30 weeks. Gives you time but not too early in case
          you want to change things!
        </ChatMessage>
        <ChatMessage top="45%" left="80%">
          <b>Jessica R.</b>
          <br />
          Rest when they nap! And don&apos;t feel guilty about screen time
          during pregnancy &ndash; you need breaks too 💗
        </ChatMessage>
        <ChatMessage top="62%" left="76%">
          <b>Karen S.</b>
          <br />
          Hang in there! Consistency with bedtime routine helped us get through
          it. It does get better!
        </ChatMessage>
        <ChatMessage top="82%" left="82%">
          <b>Anna P.</b>
          <br />
          Try making &quot;hidden veggie&quot; smoothies! My daughter loves them
          and has no idea she&apos;s drinking spinach 😁
        </ChatMessage>
      </BackgroundChatMessages>
    </Wrapper>
  );
}
