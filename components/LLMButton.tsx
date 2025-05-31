import getBackendUrl from "@/constants/getBackendUrl";

import { useAppStore } from "@/hooks/useAppStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

export default function App() {
	const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
	const [isRecording, setIsRecording] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const clientId = useAppStore((state) => state.clientId);
	const sizeSetting = useAppStore((state) => state.settings?.size || "medium");

	const getIconSize = () => {
		switch (sizeSetting) {
			case "small":
				return 40;
			case "large":
				return 80;
			default:
				return 65;
		}
	};

	const getButtonSize = () => {
		const iconSize = getIconSize();
		return 40 + iconSize; // make button larger proportionally
	};

	const record = async () => {
		Speech.stop();
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
		await audioRecorder.prepareToRecordAsync();
		audioRecorder.record();
		setIsRecording(true);
	};

	const stopRecording = async () => {
		await audioRecorder.stop();
		setIsRecording(false);
		setIsProcessing(true);

		if (audioRecorder.uri) {
			try {
				const formData = new FormData();
				formData.append("file", {
					uri: audioRecorder.uri,
					name: audioRecorder.uri.split("/").pop() || "recording.m4a",
					type: "audio/m4a",
				} as any);

				const response = await fetch(`http://${await getBackendUrl()}/llm?client_id=${clientId}`, {
					method: "POST",
					body: formData,
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});

				if (!response.ok) {
					Alert.alert("Failed to send recording");
				}
				const data = await response.json();
				setIsProcessing(false);
				Speech.speak(data.response, { language: "ur" });
			} catch (error) {
				setIsProcessing(false);
				Alert.alert("Error sending recording", String(error));
			}
		}
	};

	useEffect(() => {
		(async () => {
			const status = await AudioModule.requestRecordingPermissionsAsync();
			if (!status.granted) {
				Alert.alert("Permission to access microphone was denied");
			}
		})();
	}, []);

	const buttonSize = getButtonSize();
	const iconSize = getIconSize();

	return (
		<Pressable
			onPress={isRecording ? stopRecording : record}
			disabled={isProcessing}
			style={({ pressed }) => [
				styles.micButton,
				{
					backgroundColor: isProcessing
						? "#95a5a6" // gray during processing
						: pressed
						? "#e67e22" // darker orange when pressed
						: isRecording
						? "#d35400" // deeper orange when recording
						: "#f39c12",
					width: buttonSize,
					height: buttonSize,
					borderRadius: buttonSize / 2,
				},
			]}>
			{isProcessing ? <ActivityIndicator size='small' color='#fff' /> : <MaterialIcons name={isRecording ? "mic-off" : "mic"} size={iconSize} color='#fff' />}
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
