import config from "@/constants/config.json";
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet } from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";

export default function ImageInteractionScreen() {
	const [image, setImage] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

	const pickImage = async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!permission.granted) {
			Alert.alert("Permission required", "Please grant media library access.");
			return;
		}
		const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
		if (!result.canceled && result.assets?.[0]) {
			setImage(result.assets[0]);
		}
	};

	const sendToOCR = async () => {
		if (!image) return;
		setLoading(true);
		const formData = new FormData();
		formData.append("file", {
			uri: image.uri,
			type: "image/jpeg",
			name: image.uri.split("/").pop(),
		} as any);
		try {
			const res = await fetch(`http://${config.backendURLBase}/ocr-image`, {
				method: "POST",
				body: formData,
				headers: { "Content-Type": "multipart/form-data" },
			});
			const data = await res.json();
			Speech.speak(data.text);
		} catch (err) {
			Alert.alert("OCR failed", String(err));
		} finally {
			setLoading(false);
		}
	};

	const sendToLLMText = async () => {
		if (!image) return;
		setLoading(true);
		const formData = new FormData();
		formData.append("file", {
			uri: image.uri,
			type: "image/jpeg",
			name: image.uri.split("/").pop(),
		} as any);
		formData.append("prompt", "Describe the scene in this image");
		try {
			const res = await fetch(`http://${config.backendURLBase}/llm-image-text?prompt=Describe%20the%20scene`, {
				method: "POST",
				body: formData,
				headers: { "Content-Type": "multipart/form-data" },
			});
			const data = await res.json();
			Speech.speak(data.response);
		} catch (err) {
			Alert.alert("LLM scene description failed", String(err));
		} finally {
			setLoading(false);
		}
	};

	const sendToLLMWithVoice = async () => {
		if (!image) return;
		try {
			const permission = await AudioModule.requestRecordingPermissionsAsync();
			if (!permission.granted) {
				Alert.alert("Permission required", "Microphone access is needed.");
				return;
			}

			await recorder.prepareToRecordAsync();
			recorder.record();
			Alert.alert("Recording", "Recording started. Tap OK to stop.", [
				{
					text: "OK",
					onPress: async () => {
						await recorder.stop();
						const audioUri = recorder.uri;
						if (!audioUri) return;

						setLoading(true);
						const formData = new FormData();
						formData.append("image", {
							uri: image.uri,
							type: "image/jpeg",
							name: image.uri.split("/").pop(),
						} as any);
						formData.append("audio", {
							uri: audioUri,
							type: "audio/m4a",
							name: audioUri.split("/").pop(),
						} as any);

						const res = await fetch(`http://${config.backendURLBase}/llm-image`, {
							method: "POST",
							body: formData,
							headers: { "Content-Type": "multipart/form-data" },
						});
						const data = await res.json();
						Speech.speak(data.llm_response);
						setLoading(false);
					},
				},
			]);
		} catch (err) {
			Alert.alert("LLM voice interaction failed", String(err));
			setLoading(false);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Button mode='contained' onPress={pickImage} style={styles.button}>
				Pick Image
			</Button>

			{image && <Image source={{ uri: image.uri }} style={styles.image} />}

			{loading && <ActivityIndicator size='large' style={{ marginVertical: 20 }} />}

			{image && !loading && (
				<>
					<Button mode='outlined' onPress={sendToOCR} style={styles.button}>
						OCR
					</Button>
					<Button mode='outlined' onPress={sendToLLMText} style={styles.button}>
						Describe Scene
					</Button>
					<Button mode='outlined' onPress={sendToLLMWithVoice} style={styles.button}>
						LLM Talk
					</Button>
				</>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		alignItems: "center",
	},
	button: {
		marginVertical: 10,
		width: "100%",
	},
	image: {
		width: 300,
		height: 300,
		resizeMode: "contain",
		marginVertical: 20,
	},
});
