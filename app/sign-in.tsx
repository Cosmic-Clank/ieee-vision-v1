import { useSession } from "@/contexts/loginctx";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignIn() {
	const { signIn } = useSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignIn = async () => {
		if (!email || !password) {
			Alert.alert("Missing email or password");
			return;
		}

		setLoading(true);
		try {
			await signIn(email, password);
			console.log("Sign-in successful, redirecting to home...");
			router.replace("/");
		} catch (err) {
			Alert.alert("Login Failed", err instanceof Error ? err.message : "Unexpected error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome Back</Text>

			<TextInput placeholder='Email' placeholderTextColor='#aaa' style={styles.input} autoCapitalize='none' keyboardType='email-address' value={email} onChangeText={setEmail} />

			<TextInput placeholder='Password' placeholderTextColor='#aaa' style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

			<Pressable style={styles.button} onPress={handleSignIn} disabled={loading}>
				{loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>Sign In</Text>}
			</Pressable>

			<Text style={styles.altText}>
				Don’t have an account?{" "}
				<Text style={styles.link} onPress={() => router.push("/register")}>
					Register
				</Text>
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: "center",
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 24,
		color: "#222",
		textAlign: "center",
	},
	input: {
		backgroundColor: "#f1f1f1",
		padding: 12,
		borderRadius: 8,
		fontSize: 16,
		marginBottom: 16,
		color: "#000",
	},
	button: {
		backgroundColor: "#3498db",
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	altText: {
		marginTop: 16,
		textAlign: "center",
		color: "#555",
	},
	link: {
		color: "#3498db",
		fontWeight: "600",
	},
});
