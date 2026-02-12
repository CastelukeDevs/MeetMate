import { zustandMMKVStorage } from "@/utils/zustandMMKV";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AppDefaultState = {
  isFirstTime: boolean;
  setIsFirstTime: (value: boolean) => void;
};

const useAppDefault = create<AppDefaultState>()(
  persist(
    (set) => ({
      isFirstTime: true,
      setIsFirstTime: (value: boolean) => set(() => ({ isFirstTime: value })),
    }),
    {
      name: "app-default-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => ({ isFirstTime: state.isFirstTime }),
    },
  ),
);

export default useAppDefault;
