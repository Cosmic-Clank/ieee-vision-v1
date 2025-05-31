import { router, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
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
				tabBarActiveTintColor: "black",
				headerShown: true,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: {
					backgroundColor: "#f3edf7",
					borderTopWidth: 0,
				},
				headerTitleAlign: "center",
				headerTitleStyle: {
					fontSize: 20,
					fontWeight: "bold",
				},
				headerStyle: {
					backgroundColor: "#f3edf7",
				},
				headerTintColor: "black",
				tabBarLabelStyle: { fontSize: 12, textTransform: "none" },
				tabBarIconStyle: { marginTop: 0, marginBottom: 0 },
				tabBarItemStyle: { paddingTop: 5, paddingBottom: 5, paddingHorizontal: 10 },
				tabBarInactiveTintColor: "darkgray",
			}}>
			<Tabs.Screen
				name='index'
				options={{
					title: t("camera"),
					tabBarIcon: ({ color }) => <MaterialIcons color={color} size={28} name={"camera"} />,
					headerRight: () => (
						<MaterialIcons
							name='help-outline'
							size={24}
							color={"black"}
							style={{ marginRight: 10 }}
							onPress={() => {
								router.push("/(tabs)/tutorial");
							}}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='settings'
				options={{
					title: t("settings"),
					tabBarIcon: ({ color }) => <MaterialIcons color={color} size={28} name={"settings"} />,
				}}
			/>
			<Tabs.Screen
				name='tutorial'
				options={{
					title: t("tutorial"),
					tabBarIcon: ({ color }) => <MaterialIcons color={color} size={28} name={"settings"} />,
					href: null,
					headerLeft: () => (
						<MaterialIcons
							name='arrow-back'
							size={24}
							color={"black"}
							style={{ marginLeft: 10 }}
							onPress={() => {
								router.back();
							}}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
