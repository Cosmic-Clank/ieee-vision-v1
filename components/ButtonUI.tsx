import config from "@/constants/config.json";
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, View } from "react-native";

export default function App() {
	const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
	const [isRecording, setIsRecording] = useState(false);

	const record = async () => {
		await audioRecorder.prepareToRecordAsync();
		audioRecorder.record();
		setIsRecording(true);
	};

	const stopRecording = async () => {
		await audioRecorder.stop();
		setIsRecording(false);
		// The recording will be available on `audioRecorder.uri`.
		if (audioRecorder.uri) {
			try {
				const formData = new FormData();
				formData.append("file", {
					uri: audioRecorder.uri,
					name: audioRecorder.uri.split("/").pop() || "recording.m4a",
					type: "audio/m4a",
				} as any);

				const response = await fetch(`http://${config.backendURLBase}/llm`, {
					method: "POST",
					body: formData,
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});
				console.log("Recording saved to:", audioRecorder.uri);

				if (!response.ok) {
					Alert.alert("Failed to send recording");
				}
			} catch (error) {
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
		<View style={styles.container}>
			<Button title={isRecording ? "Stop Recording" : "Start Recording"} onPress={isRecording ? stopRecording : record} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		backgroundColor: "#ecf0f1",
		padding: 10,
	},
});
