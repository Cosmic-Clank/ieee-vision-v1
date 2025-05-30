import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import language from "@/constants/language.json";
import { useAppStore } from "@/hooks/useAppStore";
import { useColorScheme } from "@/hooks/useColorScheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type LanguageKey = keyof typeof language;

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const selectedLang = (useAppStore((state) => state.settings?.language) || "en") as keyof (typeof language)[LanguageKey extends keyof typeof language ? LanguageKey : never];

	// Translation helper
	const t = (key: LanguageKey) => language[key]?.[selectedLang as "en" | "ar"] ?? key;

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: true,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: Platform.select({
					ios: {
						position: "absolute",
					},
					default: {},
				}),
				headerTitleAlign: "center",
			}}>
			<Tabs.Screen
				name='index'
				options={{
					title: t("camera"),
					tabBarIcon: ({ color }) => <MaterialIcons color={color} size={28} name={"camera"} />,
				}}
			/>
			<Tabs.Screen
				name='files'
				options={{
					title: t("files"),
					tabBarIcon: ({ color }) => <MaterialIcons color={color} size={28} name={"document-scanner"} />,
				}}
			/>
			<Tabs.Screen
				name='settings'
				options={{
					title: t("settings"),
					tabBarIcon: ({ color }) => <MaterialIcons color={color} size={28} name={"settings"} />,
				}}
			/>
		</Tabs>
	);
}
