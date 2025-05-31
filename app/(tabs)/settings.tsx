import getBackendUrl from "@/constants/getBackendUrl";

import language from "@/constants/language.json";
import { useSession } from "@/contexts/loginctx";
import { useAppStore } from "@/hooks/useAppStore";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Divider, RadioButton, Switch, Text } from "react-native-paper";

const languageOptions = [
	{ key: "english", value: "en" },
	{ key: "arabic", value: "ar" },
];

const textSizeOptions = [
	{ key: "small", value: "small" },
	{ key: "medium", value: "medium" },
	{ key: "large", value: "large" },
];

const hazardCategoryGroups: { [category: string]: string[] } = {
	"people": ["person"],
	"vehicles": ["bicycle", "car", "motorbike", "aeroplane", "bus", "train", "truck", "boat"],
	"hazard": ["traffic light", "fire hydrant", "stop sign", "parking meter"],
	"animals": ["bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe"],
	"accessories": ["backpack", "umbrella", "handbag", "tie", "suitcase"],
	"sports": ["frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket"],
	"tableware": ["bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl"],
	"food": ["banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake"],
	"furniture": ["chair", "sofa", "potted plant", "bed", "dining table", "toilet", "sink", "bench"],
	"electronics": ["laptop", "TV", "cell phone", "keyboard", "mouse"],
	"home appliances": ["refrigerator", "microwave", "oven", "toaster", "hair drier"],
	"items": ["book", "clock", "vase", "scissors", "teddy bear", "toothbrush", "remote"],
};

export default function SettingsScreen() {
	const { session, signOut } = useSession();
	const { settings, setSettings } = useAppStore();
	const [localSettings, setLocalSettings] = useState(settings);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!session) return;

		const fetchSettings = async () => {
			setLoading(true);
			try {
				const res = await fetch(`http://${await getBackendUrl()}/settings?user_id=${session.user.id}`);
				const data = await res.json();
				setSettings(data);
				setLocalSettings(data);
			} catch {
				Alert.alert("Failed to load settings");
			} finally {
				setLoading(false);
			}
		};

		fetchSettings();
	}, [session]);

	const getFontSize = () => {
		switch (localSettings?.size) {
			case "small":
				return 14;
			case "medium":
				return 18;
			case "large":
				return 22;
			default:
				return 16;
		}
	};

	type LanguageKey = keyof typeof language;
	const t = (key: LanguageKey) => (language[key] as { [lang: string]: string })?.[localSettings?.language ?? "en"] ?? (key as string);

	const toggleHazard = (hazard: string) => {
		if (!localSettings) return;
		const updated = localSettings.hazards.includes(hazard) ? localSettings.hazards.filter((h) => h !== hazard) : [...localSettings.hazards, hazard];
		setLocalSettings({ ...localSettings, hazards: updated });
	};

	const handleSave = async () => {
		if (!localSettings) return;
		setSaving(true);
		try {
			const allHazards = Object.values(hazardCategoryGroups).flat();
			const cleanedHazards = localSettings.hazards.filter((h) => allHazards.includes(h));

			const res = await fetch(`http://${await getBackendUrl()}/settings`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user_id: session.user.id, ...localSettings, hazards: cleanedHazards }),
			});

			if (!res.ok) throw new Error();
			setSettings({ ...localSettings, hazards: cleanedHazards });
			Alert.alert(t("save settings"));
		} catch {
			Alert.alert(t("failed to save settings"));
		} finally {
			setSaving(false);
		}
	};

	const handleSignOut = () => {
		signOut();
		router.replace("/sign-in");
	};

	if (loading || !localSettings) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator animating={true} size='large' />
			</View>
		);
	}

	const fontSize = getFontSize();

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text variant='titleMedium' style={[styles.label, { fontSize }]}>
				{t("language")}
			</Text>
			<RadioButton.Group onValueChange={(value) => setLocalSettings({ ...localSettings, language: value })} value={localSettings.language}>
				{languageOptions.map(({ key, value }) => (
					<RadioButton.Item key={value} label={t(key as LanguageKey)} value={value} labelStyle={{ fontSize }} />
				))}
			</RadioButton.Group>

			<Divider style={{ marginVertical: 10 }} />

			<Text variant='titleMedium' style={[styles.label, { fontSize }]}>
				{t("text size")}
			</Text>
			<RadioButton.Group onValueChange={(value) => setLocalSettings({ ...localSettings, size: value })} value={localSettings.size}>
				{textSizeOptions.map(({ key, value }) => (
					<RadioButton.Item key={value} label={t(key as LanguageKey)} value={value} labelStyle={{ fontSize }} />
				))}
			</RadioButton.Group>

			<Divider style={{ marginVertical: 10 }} />

			<Text variant='titleMedium' style={[styles.label, { fontSize }]}>
				{t("hazards")}
			</Text>

			{Object.entries(hazardCategoryGroups).map(([category, hazards]) => {
				const allSelected = hazards.every((hazard) => localSettings.hazards.includes(hazard));
				const noneSelected = hazards.every((hazard) => !localSettings.hazards.includes(hazard));
				const categorySwitchValue = allSelected ? true : noneSelected ? false : true;

				const toggleCategory = () => {
					let updated;
					if (allSelected) {
						updated = localSettings.hazards.filter((h) => !hazards.includes(h));
					} else {
						const additions = hazards.filter((h) => !localSettings.hazards.includes(h));
						updated = Array.from(new Set([...localSettings.hazards, ...additions]));
					}
					setLocalSettings({ ...localSettings, hazards: updated });
				};

				return (
					<View key={category} style={styles.categorySection}>
						<View style={styles.categoryHeader}>
							<Text style={[styles.categoryLabel, { fontSize }]}>{t(category as LanguageKey)}</Text>
							<Switch value={categorySwitchValue} onValueChange={toggleCategory} />
						</View>
						{hazards.map((hazard) => (
							<View key={hazard} style={styles.hazardRow}>
								<Text style={{ fontSize: fontSize - 2, paddingLeft: 18 }}>{t(hazard as LanguageKey) ?? hazard}</Text>
								<Switch value={localSettings.hazards.includes(hazard)} onValueChange={() => toggleHazard(hazard)} />
							</View>
						))}
					</View>
				);
			})}

			<Button mode='contained' onPress={handleSave} loading={saving} disabled={saving} style={styles.saveButton}>
				{t("save settings")}
			</Button>

			<Button mode='contained' buttonColor='#e74c3c' textColor='#fff' onPress={handleSignOut} style={styles.signOutButton}>
				{t("sign out")}
			</Button>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: "#fffbfe",
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	label: {
		marginTop: 16,
		marginBottom: 8,
		fontWeight: "bold",
	},
	hazardRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginVertical: 6,
	},
	saveButton: {
		marginTop: 24,
	},
	signOutButton: {
		marginTop: 16,
	},
	categorySection: {
		marginBottom: 20,
	},
	categoryHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
		paddingVertical: 4,
	},
	categoryLabel: {
		fontWeight: "900",
		textTransform: "capitalize",
	},
});
