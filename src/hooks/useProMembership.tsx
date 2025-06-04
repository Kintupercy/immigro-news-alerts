
import { User } from "@supabase/supabase-js";

// Simplified hook since everything is free now
export const useProMembership = (user: User | null) => {
  return { isProMember: true, loading: false };
};
