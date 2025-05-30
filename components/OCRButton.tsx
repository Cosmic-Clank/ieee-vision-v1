import config from "@/constants/config.json";
import { useAppStore } from "@/hooks/useAppStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Speech from "expo-speech";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

export default function OCRButton() {
	const [isProcessing, setIsProcessing] = useState(false);
	const clientId = useAppStore((state) => state.clientId);

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

	return (
		<Pressable
			onPress={triggerOCR}
			disabled={isProcessing}
			style={({ pressed }) => [
				styles.micButton,
				{
					backgroundColor: isProcessing ? "#95a5a6" : pressed ? "#2980b9" : "#3498db",
				},
			]}>
			{isProcessing ? <ActivityIndicator size='small' color='#fff' /> : <MaterialIcons name='text-fields' size={40} color='#fff' />}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	micButton: {
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
