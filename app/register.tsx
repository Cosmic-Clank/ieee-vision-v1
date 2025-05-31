import getBackendUrl from "@/constants/getBackendUrl";

import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [loading, setLoading] = useState(false);

	const register = async () => {
		if (!email || !password) {
			Alert.alert("Please enter both email and password");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch(`http://${await getBackendUrl()}/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.detail || "Registration failed");
			}

			Alert.alert("Registered successfully");
			router.replace("/"); // Redirect to home or sign-in
		} catch (err) {
			if (err instanceof Error) {
				Alert.alert("Error", err.message);
			} else {
				Alert.alert("Error", "An unknown error occurred");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Create an Account</Text>

			<TextInput placeholder='Email' placeholderTextColor='#aaa' value={email} onChangeText={setEmail} style={styles.input} autoCapitalize='none' keyboardType='email-address' />

			<TextInput placeholder='Password' placeholderTextColor='#aaa' value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

			<Pressable style={styles.button} onPress={register} disabled={loading}>
				{loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>Register</Text>}
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: "center",
		backgroundColor: "#fdfdfd",
	},
	title: {
		fontSize: 28,
		marginBottom: 24,
		fontWeight: "bold",
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
		backgroundColor: "#2ecc71",
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
});
