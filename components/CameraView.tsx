import { useAppState } from "@react-native-community/hooks";
import { useIsFocused } from "@react-navigation/native";
import { Canvas, Rect, Text as SkiaText, useFont } from "@shopify/react-native-skia";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission, useSkiaFrameProcessor } from "react-native-vision-camera";
import { useRunOnJS } from "react-native-worklets-core";

const WS_URL = "ws://192.168.1.125:8000/ws"; // Replace with your backend IP
const HAZARD_LABELS = ["bottle", "gun", "fire"];

export default function VisionYOLO() {
	const { hasPermission, requestPermission } = useCameraPermission();
	const device = useCameraDevice("back");
	const [boxes, setBoxes] = useState<{ box: [number, number, number, number]; confidence: number; label: string }[]>([]);
	const [wsConnected, setWsConnected] = useState(false);
	const ws = useRef<WebSocket | null>(null);
	const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 12);
	const spokenHazards = useRef<Map<string, NodeJS.Timeout | number>>(new Map());
	const [clientId, setClientId] = useState<string | null>(null);

	const isFocused = useIsFocused();
	const appState = useAppState();
	const isActive = isFocused && appState === "active";

	const boxesRef = useRef<any[]>([]);
	useEffect(() => {
		boxesRef.current = boxes;

		// Check for hazards and speak
		if (Array.isArray(boxes)) {
			boxes.forEach((box) => {
				if (HAZARD_LABELS.includes(box.label) && !spokenHazards.current.has(box.label)) {
					Speech.speak(`Warning, ${box.label} hazard detected.`);
					const timeout = setTimeout(() => {
						spokenHazards.current.delete(box.label);
					}, 5000); // Speak again after 5 seconds
					spokenHazards.current.set(box.label, timeout);
				}
			});
		}
	}, [boxes]);

	const sendDataToBackend = useRunOnJS((data: any) => {
		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify(data));
		} else {
			console.error("WebSocket is not open. Cannot send data.");
		}
	}, []);

	const format = useCameraFormat(device, []);

	useEffect(() => {
		requestPermission();
	}, [requestPermission]);

	useEffect(() => {
		let reconnectTimeout: ReturnType<typeof setTimeout>;

		function connectWebSocket() {
			ws.current = new WebSocket(WS_URL);

			ws.current.onopen = () => {
				console.log("WebSocket connected");
				setWsConnected(true);
			};

			ws.current.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					if (data.client_id) {
						// Received client ID on connection
						setClientId(data.client_id);
						console.log("Received client_id:", data.client_id);
					} else {
						setBoxes(data);
					}
				} catch (err) {
					console.error("Failed to parse box JSON:", err);
				}
			};

			ws.current.onerror = (err) => {
				console.error("WebSocket error:", err);
			};

			ws.current.onclose = () => {
				console.warn("WebSocket disconnected, attempting to reconnect...");
				setWsConnected(false);
				reconnectTimeout = setTimeout(connectWebSocket, 2000); // try again after 2s
			};
		}

		connectWebSocket();

		return () => {
			clearTimeout(reconnectTimeout);
			ws.current?.close();
		};
	}, []);

	const lastSentRef = useRef<number | null>(null);

	const frameProcessor = useSkiaFrameProcessor((frame) => {
		"worklet";

		frame.render();

		if (!lastSentRef.current || frame.timestamp - lastSentRef.current > 100_000_000) {
			lastSentRef.current = frame.timestamp;
			const buffer = frame.toArrayBuffer();
			const data = {
				width: frame.width,
				height: frame.height,
				image: new Uint8Array(buffer).toString(),
			};
			sendDataToBackend(data);
		}
	}, []);

	if (!hasPermission || device == null) {
		return (
			<View style={styles.center}>
				<Text style={{ color: "#fff" }}>Waiting for camera permission...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Camera style={{ position: "absolute", width: 480, height: 640 }} device={device} isActive={isActive} frameProcessor={frameProcessor} pixelFormat='yuv' />
			<Canvas style={StyleSheet.absoluteFill}>
				{Array.isArray(boxes)
					? boxes.map((box, index) => {
							const [x1, y1, x2, y2] = box.box;
							return (
								<React.Fragment key={index}>
									<Rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} color='lime' style='stroke' strokeWidth={2} />
									<SkiaText x={x1} y={y1 - 4} text={`${box.label} (${(box.confidence * 100).toFixed(1)}%)`} color='lime' font={font} />
								</React.Fragment>
							);
					  })
					: null}
			</Canvas>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	center: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "black",
	},
});
