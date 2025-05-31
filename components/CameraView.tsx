import getBackendUrl from "@/constants/getBackendUrl";

import { useAppStore } from "@/hooks/useAppStore";
import { useAppState } from "@react-native-community/hooks";
import { useIsFocused } from "@react-navigation/native";
import { Canvas, Rect, Text as SkiaText, useFont } from "@shopify/react-native-skia";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission, useSkiaFrameProcessor } from "react-native-vision-camera";
import { useRunOnJS } from "react-native-worklets-core";

export default function VisionYOLO() {
	const { hasPermission, requestPermission } = useCameraPermission();
	const device = useCameraDevice("back");
	const [boxes, setBoxes] = useState<{ box: [number, number, number, number]; confidence: number; label: string }[]>([]);
	const [wsConnected, setWsConnected] = useState(false);
	const ws = useRef<WebSocket | null>(null);
	const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 16);

	const spokenHazards = useRef<Map<string, NodeJS.Timeout | number>>(new Map());
	const settings = useAppStore((state) => state.settings);
	const hazardLabels = settings?.hazards ?? [];
	const isMuted = useAppStore((state) => state.mute); // 👈 Zustand mute state

	const isFocused = useIsFocused();
	const appState = useAppState();
	const isActive = isFocused && appState === "active";

	const boxesRef = useRef<any[]>([]);
	useEffect(() => {
		boxesRef.current = boxes;

		if (Array.isArray(boxes)) {
			boxes.forEach((box) => {
				if (hazardLabels.includes(box.label) && !spokenHazards.current.has(box.label)) {
					if (!isMuted) {
						Speech.speak(`Warning, ${box.label} detected infront of you.`);
					}
					const timeout = setTimeout(() => {
						spokenHazards.current.delete(box.label);
					}, 5000);
					spokenHazards.current.set(box.label, timeout);
				}
			});
		}
	}, [boxes, hazardLabels, isMuted]);

	const sendDataToBackend = useRunOnJS((data: any) => {
		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify(data));
		}
	}, []);

	const format = useCameraFormat(device, []);

	useEffect(() => {
		requestPermission();
	}, [requestPermission]);

	useEffect(() => {
		let reconnectTimeout: ReturnType<typeof setTimeout>;

		async function connectWebSocket() {
			try {
				const backendUrl = await getBackendUrl(); // ✅ get the URL here
				ws.current = new WebSocket(`ws://${backendUrl}/ws`);

				ws.current.onopen = () => {
					console.log("WebSocket connected");
					setWsConnected(true);
				};

				ws.current.onmessage = (event) => {
					try {
						const data = JSON.parse(event.data);
						if (data.client_id) {
							useAppStore.getState().setClientId(data.client_id);
							console.log("Received client_id:", data.client_id);
						} else {
							setBoxes(data);
						}
					} catch (err) {
						console.error("Failed to parse box JSON:", err);
					}
				};

				ws.current.onerror = () => {};

				ws.current.onclose = () => {
					setWsConnected(false);
					reconnectTimeout = setTimeout(connectWebSocket, 2000); // retry
				};
			} catch (err) {
				console.error("Failed to connect WebSocket:", err);
			}
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

		if (!lastSentRef.current || frame.timestamp - lastSentRef.current > 200_000_000) {
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
				{Array.isArray(boxes) &&
					font &&
					boxes.map((box, index) => {
						const [x1, y1, x2, y2] = box.box;
						const isHazard = hazardLabels.includes(box.label);
						return (
							<React.Fragment key={index}>
								<Rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} color={isHazard ? "red" : "lime"} style='stroke' strokeWidth={3} />
								<SkiaText x={x1} y={y1 - 6} text={`${box.label} (${(box.confidence * 100).toFixed(1)}%)`} color={isHazard ? "red" : "lime"} font={font} />
							</React.Fragment>
						);
					})}
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
