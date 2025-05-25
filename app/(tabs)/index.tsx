import { PaintStyle, Skia } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission, useSkiaFrameProcessor } from "react-native-vision-camera";
import { useRunOnJS } from "react-native-worklets-core";

const WS_URL = "ws://192.168.1.125:8000/ws"; // Replace with your backend IP

export default function VisionYOLO() {
	const { hasPermission, requestPermission } = useCameraPermission();
	const device = useCameraDevice("back");
	const [boxes, setBoxes] = useState<any[]>([]);
	const ws = useRef<WebSocket | null>(null);

	const boxesRef = useRef<any[]>([]);
	useEffect(() => {
		boxesRef.current = boxes;
	}, [boxes]);

	const sendDataToBackend = useRunOnJS((data: any) => {
		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify(data));
		} else {
			console.error("WebSocket is not open. Cannot send data.");
		}
	}, []);

	const format = useCameraFormat(device, [
		{
			fps: 10,
			videoResolution: { width: 352, height: 288 },
		},
	]);

	useEffect(() => {
		requestPermission();
	}, [requestPermission]);

	useEffect(() => {
		ws.current = new WebSocket(WS_URL);

		ws.current.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				setBoxes(data);
			} catch (err) {
				console.error("Failed to parse box JSON:", err);
			}
		};

		ws.current.onerror = (err) => {
			console.error("WebSocket error:", err);
		};

		return () => {
			ws.current?.close();
		};
	}, []);

	const frameProcessor = useSkiaFrameProcessor((frame) => {
		"worklet";

		frame.render();

		const currentBoxes = boxesRef.current ?? [];
		const paint = Skia.Paint();
		paint.setColor(Skia.Color("red"));
		paint.setStyle(PaintStyle.Stroke);
		paint.setStrokeWidth(2);
		for (const box of currentBoxes) {
			const [x1, y1, x2, y2] = box.box;
			const rect = Skia.XYWHRect(x1, y1, x2 - x1, y2 - y1);
			frame.drawRect(rect, paint);
		}

		const buffer = frame.toArrayBuffer();
		const data = {
			width: frame.width,
			height: frame.height,
			image: new Uint8Array(buffer).toString(),
		};

		// sendDataToBackend(data);
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
			<Camera style={StyleSheet.absoluteFill} device={device} isActive={true} frameProcessor={frameProcessor} fps={10} format={format} />
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
