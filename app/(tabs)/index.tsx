import ButtonUI from "@/components/ButtonUI";
import VisionYOLO from "@/components/CameraView";
import React from "react";
import { StyleSheet, View } from "react-native";

const index = () => {
	return (
		<View style={styles.container}>
			<VisionYOLO />
			<ButtonUI />
		</View>
	);
};

export default index;

const styles = StyleSheet.create({
	container: {
		flex: 1, // ⬅️ Make sure this fills the screen
		backgroundColor: "black", // optional
	},
});
