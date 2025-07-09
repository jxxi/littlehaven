'use client';

import { useEffect, useRef, useState } from 'react';

import { cities } from '@/utils/cities';

const brand = {
  purple: '#6366f1',
  blue: '#06b6d4',
  green: '#1db981',
  orange: '#f59e0b',
  pink: '#ec4899',
  lavender: '#8b5cf6',
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-8">
    {children}
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full max-w-[520px] flex-col items-center overflow-hidden rounded-2xl border border-white/20 bg-white/95 p-0 shadow-lg backdrop-blur-sm">
    {children}
  </div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full flex-col items-center px-10 py-14">
    {children}
  </div>
);

const Form = ({
  children,
  onSubmit,
}: {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <form className="flex w-full flex-col gap-8" onSubmit={onSubmit}>
    {children}
  </form>
);

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
  style,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  style?: React.CSSProperties;
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
    style={style}
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

const AutocompleteContainer = ({
  children,
  ref,
}: {
  children: React.ReactNode;
  ref?: React.RefObject<HTMLDivElement>;
}) => (
  <div ref={ref} className="relative w-full">
    {children}
  </div>
);

const AutocompleteDropdown = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute inset-x-0 top-full z-10 max-h-48 overflow-y-auto rounded-b-xl border border-t-0 border-gray-200/80 bg-white/95 shadow-lg backdrop-blur-sm">
    {children}
  </div>
);

const AutocompleteItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      className="cursor-pointer border-b border-gray-100/60 px-5 py-3 transition-colors duration-200 last:border-b-0 hover:bg-gray-50/80"
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

const ModalOverlay = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <div
      role="button"
      tabIndex={0}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/25"
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

const ModalContent = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
  };
  const interactiveProps = onClick
    ? {
        tabIndex: 0,
        onClick,
        onKeyDown: handleKeyDown,
      }
    : {};
  return (
    <div
      role="dialog"
      className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/95 p-8 text-center shadow-xl backdrop-blur-sm"
      {...interactiveProps}
    >
      {children}
    </div>
  );
};

const ModalButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <Button onClick={onClick} className="mt-6 w-full">
    {children}
  </Button>
);

const ChatMessage = ({
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
      top: `calc(${top} + 8px)`, // add a small gap from the top
      left: `calc(${left} + 8px)`, // add a small gap from the left
      width,
      opacity: 0.35,
    }}
  >
    {children}
  </div>
);

const Hero = ({ children }: { children: React.ReactNode }) => (
  <section className="relative flex w-full flex-col items-center overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 py-10 pb-6">
    {children}
  </section>
);

const HeroTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className="mb-2 text-center font-['Edu_NSW_ACT_Cursive'] text-[2.2rem] font-semibold tracking-tight text-white drop-shadow-lg">
    {children}
  </h1>
);

const HeroTagline = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-center text-lg font-normal text-gray-100">{children}</h2>
);

const HeroSubtitle = ({
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

const CirclesIcon = ({ children }: { children: React.ReactNode }) => (
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

const Circle1 = () => (
  <Circle
    className="size-8 bg-gradient-to-br from-indigo-500 to-purple-600"
    style={{
      top: '22px', // centered, offset for orbit
      left: '34px',
      animation: 'float 3s ease-in-out infinite',
    }}
  />
);

const Circle2 = () => (
  <Circle
    className="size-6 bg-gradient-to-br from-cyan-500 to-cyan-700"
    style={{
      top: '54px', // centered, offset down
      left: '60px',
      animation: 'float 3s ease-in-out infinite 0.5s',
    }}
  />
);

const Circle3 = () => (
  <Circle
    className="size-7 bg-gradient-to-br from-emerald-500 to-emerald-700"
    style={{
      top: '60px', // centered, offset down
      left: '18px',
      animation: 'float 3s ease-in-out infinite 1s',
    }}
  />
);

const Circle4 = () => (
  <Circle
    className="size-5 bg-gradient-to-br from-amber-500 to-amber-600"
    style={{
      top: '30px', // centered, offset up
      left: '65px',
      animation: 'float 3s ease-in-out infinite 1.5s',
    }}
  />
);

const LogoContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mb-8 inline-block">{children}</div>
);

const Logo = ({ children }: { children: React.ReactNode }) => (
  <div className="flex size-[120px] items-center justify-center rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-105">
    {children}
  </div>
);

const BackgroundChatMessages = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="pointer-events-none fixed inset-0 z-0 hidden md:block">
    {children}
  </div>
);

const CloseButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    className="absolute right-4 top-4 z-10 border-none bg-transparent text-2xl text-gray-400 transition-colors duration-200 hover:text-indigo-500"
    onClick={onClick}
  >
    {children}
  </button>
);

export default function IndexPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (newEmail: string) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(newEmail);

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (value.length > 1) {
      const filtered = cities
        .filter((city) => city.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (city: string) => {
    setLocation(city);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setError('');
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, location }),
      });

      await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setEmailError('This email is already signed up.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setShowModal(true);
        setName('');
        setEmail('');
        setLocation('');
      }
    } catch (fetchError) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            <Form onSubmit={handleSubmit}>
              <HeroSubtitle
                style={{ color: brand.purple, marginBottom: '1.5rem' }}
              >
                Launching soon! Signup to be one of the first to join!
              </HeroSubtitle>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={emailError ? { borderColor: brand.orange } : {}}
                />
                {emailError && <Error>{emailError}</Error>}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <AutocompleteContainer ref={inputRef}>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    required
                    placeholder="Enter your city"
                    autoComplete="off"
                  />
                  {showSuggestions && (
                    <AutocompleteDropdown>
                      {suggestions.map((city) => (
                        <AutocompleteItem
                          key={city}
                          onClick={() => selectSuggestion(city)}
                        >
                          {city}
                        </AutocompleteItem>
                      ))}
                    </AutocompleteDropdown>
                  )}
                </AutocompleteContainer>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Join the Community'}
              </Button>
            </Form>
            {error && <Error>{error}</Error>}
          </CardContent>
        </Card>
        {showModal && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => setShowModal(false)}>
                &times;
              </CloseButton>
              <h3 style={{ color: brand.purple, marginBottom: '1rem' }}>
                Welcome to Little Haven!
              </h3>
              <p style={{ color: '#444', marginBottom: '1.5rem' }}>
                Thanks for joining! We&apos;ll be in touch soon.
                <br />
                Check your inbox for updates.
              </p>
              <ModalButton onClick={() => setShowModal(false)}>
                Close
              </ModalButton>
            </ModalContent>
          </ModalOverlay>
        )}
      </Wrapper>
      <BackgroundChatMessages>
        <ChatMessage top="8%" left="6%">
          <b>Sarah M.</b>
          <br />
          My 18-month-old just started walking! 🎉
        </ChatMessage>
        <ChatMessage top="18%" left="8%">
          <b>Rachel T.</b>
          <br />
          First pregnancy here &ndash; 28 weeks! When did you all start setting
          up the nursery?
        </ChatMessage>
        <ChatMessage top="35%" left="7%">
          <b>Emma L.</b>
          <br />
          Currently 32 weeks pregnant with my second. The tiredness is real! How
          do you manage with a toddler?
        </ChatMessage>
        <ChatMessage top="45%" left="9%">
          <b>Lisa H.</b>
          <br />
          Sleep regression at 15 months &ndash; please tell me this phase ends
          soon! 😅
        </ChatMessage>
        <ChatMessage top="70%" left="5%">
          <b>David K.</b>
          <br />
          Our 2-year-old refuses to eat vegetables. Anyone have creative ideas
          that actually work?
        </ChatMessage>
        <ChatMessage top="12%" left="70%">
          <b>Millie D.</b>
          <br />
          Congratulations! Cabinet locks and outlet covers are must-haves. Also
          watch those sharp corners!
        </ChatMessage>
        <ChatMessage top="22%" left="73%">
          <b>Tom W.</b>
          <br />
          We started around 30 weeks. Gives you time but not too early in case
          you want to change things!
        </ChatMessage>
        <ChatMessage top="40%" left="75%">
          <b>Jessica R.</b>
          <br />
          Rest when they nap! And don&apos;t feel guilty about screen time
          during pregnancy &ndash; you need breaks too 💗
        </ChatMessage>
        <ChatMessage top="60%" left="72%">
          <b>Karen S.</b>
          <br />
          Hang in there! Consistency with bedtime routine helped us get through
          it. It does get better!
        </ChatMessage>
        <ChatMessage top="75%" left="78%">
          <b>Anna P.</b>
          <br />
          Try making &quot;hidden veggie&quot; smoothies! My daughter loves them
          and has no idea she&apos;s drinking spinach 😁
        </ChatMessage>
      </BackgroundChatMessages>
    </>
  );
}
