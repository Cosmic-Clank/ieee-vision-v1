import { create } from "zustand";

interface AppState {
	clientId: string | null;
	setClientId: (id: string) => void;
	session: string | null;
	settings: {
		language: string;
		size: string;
		hazards: string[];
	} | null;
	setSettings: (settings: AppState["settings"]) => void;
}

export const useAppStore = create<AppState>((set) => ({
	clientId: null,
	setClientId: (id) => set({ clientId: id }),
	session: null,
	settings: null,
	setSettings: (settings) => set({ settings }),
}));
