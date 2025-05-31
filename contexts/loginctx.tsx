import getBackendUrl from "@/constants/getBackendUrl";

import { useAppStore } from "@/hooks/useAppStore";
import { useStorageState } from "@/hooks/useStorageState";
import { createContext, use, type PropsWithChildren } from "react";
import { Alert } from "react-native";

const AuthContext = createContext<{
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => void;
	session?: any; // You can shape this to match your backend's session format
	isLoading: boolean;
}>({
	signIn: async () => {},
	signOut: () => {},
	session: null,
	isLoading: false,
});

export function useSession() {
	const value = use(AuthContext);
	if (!value) {
		throw new Error("useSession must be wrapped in a <SessionProvider />");
	}

	return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
	const [[isLoading, session], setSession] = useStorageState("session");

	const signIn = async (email: string, password: string) => {
		const { setSettings } = useAppStore.getState(); // Access zustand setters

		try {
			const res = await fetch(`http://${await getBackendUrl()}/signin`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.detail || "Failed to sign in");
			}

			// Store session
			setSession(JSON.stringify(data));

			// 🔥 Get user settings from backend
			const settingsRes = await fetch(`http://${await getBackendUrl()}/settings?user_id=${data.user.id}`);
			const settingsData = await settingsRes.json();

			if (!settingsRes.ok) {
				throw new Error(settingsData.detail || "Failed to load user settings");
			}

			// Parse and set settings
			setSettings({
				language: settingsData.language,
				size: settingsData.size,
				hazards: settingsData.hazards, // Convert CSV to array
			});
		} catch (err: any) {
			Alert.alert("Sign in failed", err.message);
		}
	};

	const signOut = () => {
		setSession(null);
	};

	return (
		<AuthContext.Provider
			value={{
				signIn,
				signOut,
				session: session ? JSON.parse(session) : null,
				isLoading,
			}}>
			{children}
		</AuthContext.Provider>
	);
}
