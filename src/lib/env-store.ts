import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Environment = "sandbox" | "staging" | "production";

interface EnvState {
  environment: Environment;
  setEnvironment: (e: Environment) => void;
}

export const useEnvironment = create<EnvState>()(
  persist(
    (set) => ({
      environment: "sandbox",
      setEnvironment: (environment) => set({ environment }),
    }),
    { name: "dp-env" },
  ),
);
