import { zustandMMKVStorage } from "@/utils/zustandMMKV";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AppDefaultState = {
  isFirstTime: boolean;
  setIsFirstTime: (value: boolean) => void;
  notificationToken?: string;
  setNotificationToken?: (token?: string) => void;
};

const useAppDefault = create<AppDefaultState>()(
  persist(
    (set) => ({
      isFirstTime: true,
      setIsFirstTime: (value: boolean) => set(() => ({ isFirstTime: value })),
      notificationToken: undefined,
      setNotificationToken: (token?: string) =>
        set(() => ({ notificationToken: token })),
    }),
    {
      name: "app-default-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({
        isFirstTime: state.isFirstTime,
        notificationToken: state.notificationToken,
      }),
    },
  ),
);

export default useAppDefault;
