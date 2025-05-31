import { useAppStore } from "@/hooks/useAppStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { Pressable, StyleSheet } from "react-native";

export default function MuteToggleButton() {
	const muted = useAppStore((state) => state.mute);
	const setMute = useAppStore((state) => state.setMute);
	const sizeSetting = useAppStore((state) => state.settings?.size || "medium");

	const toggleMute = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
		if (muted) {
			Speech.stop();
			Speech.speak("Unmuted");
		} else {
			Speech.stop();
			Speech.speak("Muted");
		}

		setMute(!muted);
	};

	const getIconSize = () => {
		switch (sizeSetting) {
			case "small":
				return 30;
			case "large":
				return 50;
			default:
				return 45;
		}
	};

	const getButtonSize = () => {
		const icon = getIconSize();
		return 40 + icon;
	};

	const buttonSize = getButtonSize();
	const iconSize = getIconSize();

	return (
		<Pressable
			onPress={toggleMute}
			style={({ pressed }) => [
				styles.micButton,
				{
					backgroundColor: pressed ? "#7f8c8d" : muted ? "#e74c3c" : "#2ecc71",
					width: buttonSize,
					height: buttonSize,
					borderRadius: buttonSize / 2,
				},
			]}>
			<MaterialIcons name={muted ? "volume-off" : "volume-up"} size={iconSize} color='#fff' />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	micButton: {
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
	},
});
