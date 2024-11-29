import { cookies } from 'next/headers';

import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: users } = await supabase.from('users').select();

  return (
    <ul>{users?.map((user) => <li key={user.userId}>{user.username}</li>)}</ul>
  );
}
