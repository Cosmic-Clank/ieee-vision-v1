import { supabase } from "@/lib/supabase"; // Adjust to your supabase client path
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignIn = async () => {
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			Alert.alert("Sign-in error", error.message);
		} else {
			Alert.alert("Success", "You are signed in!");
		}

		setLoading(false);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Sign In</Text>

			<TextInput placeholder='Email' style={styles.input} autoCapitalize='none' value={email} onChangeText={setEmail} keyboardType='email-address' />

			<TextInput placeholder='Password' style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

			<Button title={loading ? "Signing in..." : "Sign In"} onPress={handleSignIn} disabled={loading} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		marginTop: 100,
	},
	title: {
		fontSize: 22,
		marginBottom: 20,
		fontWeight: "600",
		textAlign: "center",
	},
	input: {
		height: 48,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 6,
		marginBottom: 16,
		paddingHorizontal: 10,
	},
});
