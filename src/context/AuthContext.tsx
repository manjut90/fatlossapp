import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { supabase } from '../services/supabase';

const AuthContext =
  createContext<any>(null);

export function AuthProvider({
  children,
}: any) {
  const mounted = useRef(true);

  const [user, setUser] =
    useState<any>(null);

  const [profile, setProfile] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true);

  /* FETCH PROFILE */

  const fetchProfile =
    async (userId: string) => {
      try {
        setProfileLoading(true);

        const {
  data,
  error,
} = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();


        if (error) {
          // If no profile is found, create one
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({ id: userId, onboarding_completed: false })
              .single();

            if (insertError) {
              setProfile(null);
            } else {
              setProfile(newProfile);
            }
          } else {
            setProfile(null);
          }

          setProfileLoading(false);
          return;
        }

        setProfile(data);

        setProfileLoading(
          false
        );
      } catch (e) {
  console.error(
    'FETCH PROFILE FAILED:',
    e
  );

  setProfileLoading(
    false
  );
}
    };

  /* REFRESH PROFILE */

  const refreshProfile =
    async () => {
      if (!user?.id) return;

      await fetchProfile(
        user.id
      );
    };

  /* SIGN UP */

  const signUp =
    async (
      email: string,
      password: string
    ) => {
      const {
        data,
        error,
      } = await supabase.auth.signUp(
        {
          email,
          password,
        }
      );

      if (
        data?.user &&
        !error
      ) {
        /* CREATE PROFILE */

        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,

            onboarding_completed:
              false,
          });
      }

      return {
        data,
        error,
      };
    };

  /* SIGN IN */

  const signIn =
    async (
      email: string,
      password: string
    ) => {
      return await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );
    };

  /* SIGN OUT */

  const signOut =
    async () => {
      await supabase.auth.signOut();
    };

  /* SESSION */

  useEffect(() => {
    /* EXISTING SESSION */

    supabase.auth
      .getSession()

      .then(
        async ({
          data: { session },
        }) => {
          if (!mounted.current) return;

          const currentUser =
  session?.user;

          setUser(
            currentUser || null
          );

          if (
            currentUser?.id
          ) {
            await fetchProfile(
              currentUser.id
            );
          } else {
            setProfile(null);

            setProfileLoading(
              false
            );
          }

          setLoading(false);
        }
      )

      .catch(() => {
        if (!mounted.current) return;

        setUser(null);
        setProfile(null);
        setLoading(false);
        setProfileLoading(false);
      });

    /* AUTH LISTENER */

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session
        ) => {
          if (!mounted.current) return;

          const currentUser =
  session?.user;

          setUser(
            currentUser || null
          );

          if (
            currentUser?.id
          ) {
            await fetchProfile(
              currentUser.id
            );
          } else {
            setProfile(null);

            setProfileLoading(
              false
            );
          }

          setLoading(false);
        }
      );

    return () => {
      mounted.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,

        profile,

        loading,

        profileLoading,

        refreshProfile,

        signUp,

        signIn,

        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(
    AuthContext
  );
}