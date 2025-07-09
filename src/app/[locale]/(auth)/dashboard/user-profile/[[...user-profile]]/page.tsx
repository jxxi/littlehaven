import { UserProfile } from '@clerk/nextjs';

import { getI18nPath } from '@/utils/Helpers';

const UserProfilePage = (props: { params: { locale: string } }) => {
  return (
    <UserProfile
      routing="path"
      path={getI18nPath('/dashboard/user-profile', props.params.locale)}
      appearance={{
        elements: {
          rootBox: 'w-full p-8',
          cardBox: 'w-full flex',
        },
      }}
    />
  );
};

export default UserProfilePage;
