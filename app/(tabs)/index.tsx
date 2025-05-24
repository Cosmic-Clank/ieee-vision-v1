import { PaintStyle, Skia } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { runOnJS } from "react-native-reanimated";
import { Camera, useCameraDevice, useCameraPermission, useSkiaFrameProcessor } from "react-native-vision-camera";

const WS_URL = "ws://192.168.1.125:8000/ws"; // Replace with your backend IP

export default function VisionYOLO() {
	const { hasPermission, requestPermission } = useCameraPermission();
	const device = useCameraDevice("back");
	const ws = useRef<WebSocket | null>(null);
	const [boxes, setBoxes] = useState<any[]>([]);

	const sendDataToBackend = (data: Uint8Array) => {
		if (ws.current && ws.current.readyState === 1) {
			ws.current.send(data);
		} else {
			console.warn("WebSocket not ready");
		}
	};

	// Request camera permission on mount
	useEffect(() => {
		requestPermission();
	}, [requestPermission]);

	// Establish WebSocket connection
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

	// Define Skia paint for drawing
	const paint = Skia.Paint();
	paint.setStyle(PaintStyle.Stroke);
	paint.setColor(Skia.Color("lime"));
	paint.setStrokeWidth(2);

	// Frame processor to render camera frame and draw boxes
	const frameProcessor = useSkiaFrameProcessor(
		(frame) => {
			"worklet";

			// Render the camera frame
			frame.render();

			// Draw each bounding box
			// for (const box of boxes) {
			// 	const [x1, y1, x2, y2] = box.box;
			// 	frame.drawRect({ x: x1, y: y1, width: x2 - x1, height: y2 - y1 }, paint);
			// }
			const buffer = frame.toArrayBuffer();
			const data = new Uint8Array(buffer);

			runOnJS(sendDataToBackend)(data); // ✅ this works
		},
		[boxes]
	);

	if (!hasPermission || device == null) {
		return (
			<View style={styles.center}>
				<Text style={{ color: "#fff" }}>Waiting for camera permission...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Camera style={StyleSheet.absoluteFill} device={device} isActive={true} frameProcessor={frameProcessor} />
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
