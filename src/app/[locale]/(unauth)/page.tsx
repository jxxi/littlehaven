'use client';

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

const Label = ({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) => (
  <label className="mb-3 block text-lg font-medium" htmlFor={htmlFor}>
    {children}
  </label>
);

const Input = ({
  id,
  type = 'text',
  value,
  onChange,
  required,
  autoComplete,
  placeholder,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    autoComplete={autoComplete}
    placeholder={placeholder}
    className="w-full rounded-xl border-[1.5px] border-gray-200 bg-white/80 px-5 py-4 text-lg text-gray-700 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white/95 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
  />
);

const Button = ({
  children,
  type = 'button',
  disabled,
  onClick,
  className,
}: {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    type={type === 'submit' ? 'submit' : 'button'}
    disabled={disabled}
    onClick={onClick}
    className={`mt-2 rounded-xl border-none bg-gradient-to-r from-indigo-500 to-purple-600 px-0 py-4 text-lg font-bold text-white transition-colors duration-200 hover:from-purple-600 hover:to-indigo-500 disabled:opacity-50 ${className || ''}`}
  >
    {children}
  </button>
);

const Error = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-4 font-semibold text-orange-500">{children}</div>
);

export default function IndexPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const validateEmail = (newEmail: string) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(newEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !location.trim()) {
      setError('Please enter your name and location.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email,
          location: location.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.error || 'Something went wrong.');
      } else {
        setModalOpen(true);
        setName('');
        setEmail('');
        setLocation('');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              fontSize: '2rem',
              marginBottom: '0.5rem',
              marginTop: '0.5rem',
            }}
          >
            Join the waitlist
          </h2>
          <HeroSubtitle style={{ color: brand.purple, marginBottom: '1.5rem' }}>
            Enter your details and we&apos;ll let you know when your spot is
            ready
          </HeroSubtitle>
          <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Enter your full name"
            />
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email address"
            />
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              autoComplete="off"
              placeholder="City, State or Country"
            />
            {error && <Error>{error}</Error>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Join the waitlist'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have access?{' '}
            <a
              href="/sign-in"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Sign in
            </a>
          </div>
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
