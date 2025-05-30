import config from "@/constants/config.json";
import { useAppStore } from "@/hooks/useAppStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Speech from "expo-speech";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

export default function OCRButton() {
	const [isProcessing, setIsProcessing] = useState(false);
	const clientId = useAppStore((state) => state.clientId);
	const sizeSetting = useAppStore((state) => state.settings?.size || "medium");

	const triggerOCR = async () => {
		Speech.stop();
		setIsProcessing(true);

		try {
			const response = await fetch(`http://${config.backendURLBase}/ocr?client_id=${clientId}`);
			if (!response.ok) throw new Error("Failed to fetch OCR result");

			const data = await response.json();
			setIsProcessing(false);

			if (!data.text?.trim()) {
				Speech.speak("No text found.");
				return;
			}

			Speech.speak(`Text found: ${data.text}`);
		} catch (err) {
			setIsProcessing(false);
			Alert.alert("OCR error", String(err));
		}
	};

	const getIconSize = () => {
		switch (sizeSetting) {
			case "small":
				return 40;
			case "large":
				return 70;
			default:
				return 55;
		}
	};

	const getButtonSize = () => {
		const icon = getIconSize();
		return 40 + icon;
	};

	const buttonSize = getButtonSize();
	const iconSize = getIconSize();

	return (
		<Pressable
			onPress={triggerOCR}
			disabled={isProcessing}
			style={({ pressed }) => [
				styles.micButton,
				{
					backgroundColor: isProcessing ? "#95a5a6" : pressed ? "#2980b9" : "#3498db",
					width: buttonSize,
					height: buttonSize,
					borderRadius: buttonSize / 2,
				},
			]}>
			{isProcessing ? <ActivityIndicator size='small' color='#fff' /> : <MaterialIcons name='text-fields' size={iconSize} color='#fff' />}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	micButton: {
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
});
