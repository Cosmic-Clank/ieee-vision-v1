import Config from "@/constants/config.json";
import { useSession } from "@/contexts/loginctx";
import { useAppStore } from "@/hooks/useAppStore";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

const hazardOptions = ["Fire", "Electric Shock", "Slippery Surface", "Sharp Objects", "Radiation"];

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
				const res = await fetch(`http://${Config.backendURLBase}/settings?user_id=${session.user.id}`);
				const data = await res.json();
				setSettings(data);
				setLocalSettings(data);
			} catch (err) {
				Alert.alert("Failed to load settings");
			} finally {
				setLoading(false);
			}
		};

		fetchSettings();
	}, [session]);

	const toggleHazard = (hazard: string) => {
		if (!localSettings) return;
		const updated = localSettings.hazards.includes(hazard) ? localSettings.hazards.filter((h: string) => h !== hazard) : [...localSettings.hazards, hazard];

		setLocalSettings({ ...localSettings, hazards: updated });
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const res = await fetch(`http://${Config.backendURLBase}/settings`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user_id: session.user.id, ...localSettings }),
			});
			if (!res.ok) throw new Error();
			setSettings(localSettings);
			Alert.alert("Settings saved");
		} catch {
			Alert.alert("Failed to save settings");
		} finally {
			setSaving(false);
		}
	};

	const handleSignOut = () => {
		signOut();
		router.replace("/sign-in");
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size='large' />
			</View>
		);
	}

	if (!localSettings) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size='large' />
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.heading}>Settings</Text>

			<Text style={styles.label}>Language</Text>
			{/* <Picker selectedValue={localSettings.language}>
				<Picker.Item label='English' value='en' />
				<Picker.Item label='Urdu' value='ur' />
				<Picker.Item label='Spanish' value='es' />
			</Picker> */}

			<Text style={styles.label}>Text Size</Text>
			<Slider minimumValue={12} maximumValue={32} step={1} value={typeof localSettings.size === "string" ? Number(localSettings.size) : localSettings.size} onValueChange={(val) => setLocalSettings({ ...localSettings, size: String(val) })} />
			<Text style={styles.sliderValue}>{localSettings.size}px</Text>

			<Text style={styles.label}>Hazards</Text>
			{hazardOptions.map((hazard) => (
				<View key={hazard} style={styles.hazardRow}>
					<Text>{hazard}</Text>
					<Switch value={localSettings.hazards.includes(hazard)} onValueChange={() => toggleHazard(hazard)} />
				</View>
			))}

			<Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
				<Text style={styles.saveText}>{saving ? "Saving..." : "Save Settings"}</Text>
			</Pressable>

			<Pressable style={styles.signOutButton} onPress={handleSignOut}>
				<Text style={styles.signOutText}>Sign Out</Text>
			</Pressable>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: "#fff",
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	heading: {
		fontSize: 26,
		fontWeight: "bold",
		marginBottom: 20,
	},
	label: {
		marginTop: 16,
		fontSize: 16,
		fontWeight: "500",
	},
	picker: {
		backgroundColor: "#f2f2f2",
		borderRadius: 8,
		marginTop: 4,
	},
	sliderValue: {
		textAlign: "center",
		marginBottom: 12,
		color: "#666",
	},
	hazardRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginVertical: 8,
	},
	saveButton: {
		backgroundColor: "#3498db",
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 24,
	},
	saveText: {
		color: "#fff",
		fontWeight: "600",
	},
	signOutButton: {
		marginTop: 20,
		alignItems: "center",
	},
	signOutText: {
		color: "#e74c3c",
		fontWeight: "600",
		fontSize: 16,
	},
});
