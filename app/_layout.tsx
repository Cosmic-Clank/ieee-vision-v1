import { SplashScreenController } from "@/components/splash";
import { SessionProvider, useSession } from "@/contexts/loginctx";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	if (!loaded) {
		// Async font loading only occurs in development.
		return null;
	}

	return (
		<SessionProvider>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<SplashScreenController />
				<RootNavigator />
				<StatusBar style='auto' />
			</ThemeProvider>
		</SessionProvider>
	);
}

function RootNavigator() {
	const { session } = useSession();
	return (
		<Stack>
			<Stack.Protected guard={!!session}>
				<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
				<Stack.Screen name='+not-found' />
			</Stack.Protected>
			<Stack.Protected guard={!session}>
				<Stack.Screen name='sign-in' options={{ title: "Sign In" }} />
			</Stack.Protected>
		</Stack>
	);
}
