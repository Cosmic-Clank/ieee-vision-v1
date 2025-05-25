import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { Tensor3D } from "@tensorflow/tfjs";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { Camera, CameraType } from "expo-camera";
import { ExpoWebGLRenderingContext } from "expo-gl";
import React, { JSX, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";

const TensorCamera = cameraWithTensors(Camera);
const { width, height } = Dimensions.get("window");

export default function App(): JSX.Element {
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [isTfReady, setIsTfReady] = useState(false);
	const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
	const [predictions, setPredictions] = useState<cocoSsd.DetectedObject[]>([]);
	const rafId = useRef<number | null>(null);

	useEffect(() => {
		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === "granted");

			await tf.ready();
			await tf.setBackend("rn-webgl");
			setIsTfReady(true);

			const loadedModel = await cocoSsd.load();
			setModel(loadedModel);
		})();

		return () => {
			if (rafId.current) cancelAnimationFrame(rafId.current);
		};
	}, []);

	const handleCameraStream = (images: IterableIterator<Tensor3D>, updatePreview: () => void, gl: ExpoWebGLRenderingContext) => {
		const loop = async () => {
			const imageTensor = images.next().value;
			if (model && imageTensor) {
				const preds = await model.detect(imageTensor);
				setPredictions(preds);
				tf.dispose([imageTensor]);
			}
			rafId.current = requestAnimationFrame(loop);
		};
		loop();
	};

	if (hasPermission === null) return <View />;
	if (hasPermission === false) return <Text>No access to camera</Text>;
	if (!isTfReady || !model) return <ActivityIndicator style={styles.loading} size='large' />;

	return (
		<View style={styles.container}>
			<TensorCamera style={styles.camera} type={CameraType.back} cameraTextureHeight={1920} cameraTextureWidth={1080} resizeHeight={300} resizeWidth={300} resizeDepth={3} onReady={handleCameraStream} autorender useCustomShadersToResize={false} />
			<View style={styles.predictions}>
				{predictions.map((p, i) => (
					<Text key={i} style={styles.text}>
						{`${p.class} (${Math.round(p.score * 100)}%)`}
					</Text>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#000" },
	camera: { width: "100%", height: "70%" },
	predictions: {
		flex: 1,
		padding: 10,
		backgroundColor: "#fff",
	},
	text: {
		fontSize: 16,
		color: "#000",
	},
	loading: {
		flex: 1,
		justifyContent: "center",
	},
});
