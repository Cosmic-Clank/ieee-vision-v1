import config from "@/constants/config.json";
import { useAppStore } from "@/hooks/useAppStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Speech from "expo-speech";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

export default function DescribeSceneButton() {
	const [isProcessing, setIsProcessing] = useState(false);
	const clientId = useAppStore((state) => state.clientId);

	const handleDescribeScene = async () => {
		Speech.stop();
		setIsProcessing(true);

		try {
			const response = await fetch(`http://${config.backendURLBase}/llm-from-text?client_id=${clientId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt: "describe the scene in front of me in a short but descriptive manner, without too much extra information" }),
			});

			if (!response.ok) throw new Error("Failed to get description");

			const data = await response.json();
			setIsProcessing(false);

			if (!data.response?.trim()) {
				Alert.alert("No description generated");
				return;
			}

			Speech.speak(data.response);
		} catch (err) {
			setIsProcessing(false);
			Alert.alert("Error", String(err));
		}
	};

	return (
		<Pressable
			onPress={handleDescribeScene}
			disabled={isProcessing}
			style={({ pressed }) => [
				styles.button,
				{
					backgroundColor: isProcessing ? "#95a5a6" : pressed ? "#8e44ad" : "#9b59b6",
				},
			]}>
			{isProcessing ? <ActivityIndicator size='small' color='#fff' /> : <MaterialIcons name='image-search' size={36} color='#fff' />}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		width: 80,
		height: 80,
		borderRadius: 40,
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
});
