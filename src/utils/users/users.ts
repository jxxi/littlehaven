// import { supabase } from '@/lib/supabase';

// export async function getUserById(userId: string) {
//   const { data, error } = await supabase
//     .from('chats')
//     .select('*')
//     .eq('user_id', userId)
//     .order('created_at', { ascending: false });

//   if (error) throw error;
//   return data;
// }

// export async function createUser(userId: string, title: string) {
//   const { data, error } = await supabase
//     .from('chats')
//     .insert([{ user_id: userId, title }])
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }
