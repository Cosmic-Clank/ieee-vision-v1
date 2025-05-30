import { create } from "zustand";

interface AppState {
	clientId: string | null;
	setClientId: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
	clientId: null,
	setClientId: (id) => set({ clientId: id }),
}));
