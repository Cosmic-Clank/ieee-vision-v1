import VisionYOLO from "@/components/CameraView";
import DescribeSceneButton from "@/components/DescribeSceneButton";
import LLMButton from "@/components/LLMButton";
import OCRButton from "@/components/OCRButton";
import React from "react";
import { StyleSheet, View } from "react-native";

const index = () => {
	return (
		<View style={styles.container}>
			<VisionYOLO />
			<View style={{ flex: 1 / 3, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 20 }}>
				<OCRButton />
				<LLMButton />
				<DescribeSceneButton />
			</View>
		</View>
	);
};

export default index;

const styles = StyleSheet.create({
	container: {
		flex: 1, // ⬅️ Make sure this fills the screen
		backgroundColor: "white", // optional
	},
});
