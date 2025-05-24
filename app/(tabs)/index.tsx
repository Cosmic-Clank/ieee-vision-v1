import { PaintStyle, Skia } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission, useSkiaFrameProcessor } from "react-native-vision-camera";
import { useRunOnJS } from "react-native-worklets-core";

const WS_URL = "ws://192.168.1.125:8000/ws"; // Replace with your backend IP

export default function VisionYOLO() {
	const { hasPermission, requestPermission } = useCameraPermission();
	const device = useCameraDevice("back");
	const ws = useRef<WebSocket | null>(null);
	const [boxes, setBoxes] = useState<any[]>([]);

	const sendDataToBackend = useRunOnJS((metadata: string) => {
		console.log("Sending data to backend:", metadata);
		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify({ metadata }));
		} else {
			console.error("WebSocket is not open. Cannot send data.");
		}
	}, []);

	const format = useCameraFormat(device, [
		{
			fps: 10,
			videoResolution: { width: 352, height: 288 }, // ✅ lower res
		},
	]);
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
			const gray = new Uint8Array(buffer, 0, frame.width * frame.height);

			console.log(frame.width, frame.height, frame.pixelFormat);
			sendDataToBackend(gray.length.toString());
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
