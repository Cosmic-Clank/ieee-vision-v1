import VisionYOLO from "@/components/CameraView";
import DescribeSceneButton from "@/components/DescribeSceneButton";
import LLMButton from "@/components/LLMButton";
import MuteToggleButton from "@/components/MuteToggleButton";
import OCRButton from "@/components/OCRButton";
import ReadDocumentButton from "@/components/ReadDocumentButton";
import React from "react";
import { StyleSheet, View } from "react-native";

const index = () => {
	return (
		<View style={styles.container}>
			<VisionYOLO />
			<View style={{ flex: 1 / 7, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 30 }}>
				<OCRButton />
				<LLMButton />
				<DescribeSceneButton />
			</View>
			<View style={{ flex: 1 / 7, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 60 }}>
				<MuteToggleButton />
				<ReadDocumentButton />
			</View>
		</View>
	);
};

export default index;

const styles = StyleSheet.create({
	container: {
		flex: 1, // ⬅️ Make sure this fills the screen
		backgroundColor: "#fffbfe", // optional
		flexDirection: "column", // ⬅️ Stack children vertically
	},
});
