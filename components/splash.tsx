import getBackendUrl from "@/constants/getBackendUrl";

import { useSession } from "@/contexts/loginctx";
import { useAppStore } from "@/hooks/useAppStore";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

export function SplashScreenController() {
	const { isLoading, session } = useSession();
	const setSettings = useAppStore((state) => state.setSettings);

	useEffect(() => {
		const loadSettings = async () => {
			if (session?.user?.id) {
				try {
					const res = await fetch(`http://${await getBackendUrl()}/settings?user_id=${session.user.id}`);
					const json = await res.json();
					setSettings(json);
				} catch (error) {
					console.warn("⚠️ Failed to load user settings:", error);
				}
			}
		};

		if (!isLoading && session?.user?.id) {
			loadSettings();
		}
	}, [isLoading, session, setSettings]);

	if (!isLoading) {
		SplashScreen.hideAsync();
	}

	return null;
}
