import { Profile } from "@/types/profile.types";
import { getProfileById, updateDeviceToken } from "@/utils/profileManager";
import { supabase } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import useAppDefault from "./store/useAppDefault";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>();
  const [profile, setProfile] = useState<Profile | null>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the session once, and subscribe to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
      }
      setIsLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const notificationToken = useAppDefault((state) => state.notificationToken);

  // Fetch the profile when the session changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        setIsLoading(true);
        try {
          const data = await getProfileById(session.user.id);
          setProfile(data);
        } catch (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [session]);

  // Update device token when session or token changes
  useEffect(() => {
    if (session && notificationToken) {
      updateDeviceToken(notificationToken).catch((error) => {
        console.error("Error updating device token:", error);
      });
    }
  }, [session, notificationToken]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        isLoggedIn: session !== undefined && session !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export type AuthData = {
  session?: Session | null;
  profile?: Profile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
};

export const AuthContext = createContext<AuthData>({
  session: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
});

export const useAuthContext = () => useContext(AuthContext);
