import Image from 'next/image';

import { AppConfig } from '@/utils/AppConfig';

const Logo = () => (
  <div className="flex items-center text-xl font-semibold">
    <Image
      src="/assets/images/default-circle-icon.png"
      alt=""
      width={32}
      height={32}
      className="mr-2"
    />
    {AppConfig.name}
  </div>
);

export { Logo };
