import { supabase } from "../supabase";

//  GET CURRENT USER
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  if (!data.user) throw new Error("User not authenticated");

  return data.user;
};

//  GET USER ID 
export const getUserId = async () => {
  const user = await getCurrentUser();
  return user.id;
};