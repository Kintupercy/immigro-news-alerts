
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const useAdminAccess = () => {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // Use maybeSingle to avoid errors when no admin role exists
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Admin role check error:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user?.id,
    retry: false, // Don't retry on failure to avoid loops
  });

  return {
    isAdmin: !!isAdmin,
    isLoading,
    user
  };
};
