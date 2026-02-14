export type Profile = {
  id: string;
  updated_at?: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  device_token?: string | null;
};

export type ProfileUpdate = Partial<Omit<Profile, "id">>;
