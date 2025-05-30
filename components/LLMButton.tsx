import config from "@/constants/config.json";
import { useAppStore } from "@/hooks/useAppStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

export default function App() {
	const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
	const [isRecording, setIsRecording] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const clientId = useAppStore((state) => state.clientId);

	const record = async () => {
		Speech.stop();
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

				const response = await fetch(`http://${config.backendURLBase}/llm?client_id=${clientId}`, {
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

	return (
		<Pressable
			onPress={isRecording ? stopRecording : record}
			disabled={isProcessing}
			style={({ pressed }) => [
				styles.micButton,
				{
					backgroundColor: isProcessing ? "#95a5a6" : pressed ? "#c0392b" : isRecording ? "#e74c3c" : "#2ecc71",
				},
			]}>
			{isProcessing ? <ActivityIndicator size='small' color='#fff' /> : <MaterialIcons name={isRecording ? "mic-off" : "mic"} size={40} color='#fff' />}
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
