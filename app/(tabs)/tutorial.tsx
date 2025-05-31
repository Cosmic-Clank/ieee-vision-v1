import { useAppStore } from "@/hooks/useAppStore";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

const tutorialSteps = [
	{
		key: "1",
		image: require("@/assets/tutorial/icon.png"),
		title: { en: "Welcome!", ar: "مرحبًا!" },
		content: {
			en: "Welcome to Basira! This app helps you detect hazards and understand your surroundings in real-time using your camera.",
			ar: "مرحبًا بك في بصيرة! يساعدك هذا التطبيق على اكتشاف المخاطر وفهم محيطك في الوقت الفعلي باستخدام الكاميرا.",
		},
		speech: {
			en: "Welcome to Basira! This app helps you detect hazards and understand your surroundings in real-time using your camera.",
			ar: "مرحبًا بك في بصيرة! يساعدك هذا التطبيق على اكتشاف المخاطر وفهم محيطك في الوقت الفعلي باستخدام الكاميرا.",
		},
	},
	{
		key: "2",
		image: require("@/assets/tutorial/mainscreen.jpeg"),
		title: { en: "Main Screen", ar: "الشاشة الرئيسية" },
		content: {
			en: "On the main screen, you can see the camera view with real time detections and access various features.",
			ar: "في الشاشة الرئيسية، يمكنك رؤية عرض الكاميرا مع الكشف في الوقت الفعلي والوصول إلى ميزات متعددة.",
		},
		speech: {
			en: "On the main screen, you can see the camera view with real time detections and access various features.",
			ar: "في الشاشة الرئيسية، يمكنك رؤية عرض الكاميرا مع الكشف في الوقت الفعلي والوصول إلى ميزات متعددة.",
		},
	},
	{
		key: "3",
		image: require("@/assets/tutorial/ocr.jpg"),
		title: { en: "OCR", ar: "التعرف الضوئي على الحروف" },
		content: {
			en: "The blue icon with the text is for OCR. Tap it to recognize text in your camera view.",
			ar: "الأيقونة الزرقاء بالنص هي لـ OCR. اضغط عليها للتعرف على النص في عرض الكاميرا.",
		},
		speech: {
			en: "The blue icon with the text is for OCR. Tap it to recognize text in your camera view.",
			ar: "الأيقونة الزرقاء بالنص هي لـ OCR. اضغط عليها للتعرف على النص في عرض الكاميرا.",
		},
	},
	{
		key: "4",
		image: require("@/assets/tutorial/mute.jpg"),
		title: { en: "Mute and Unmute", ar: "كتم وتفعيل الصوت" },
		content: {
			en: "The green icon with the speaker is for muting and unmuting audio feedback from the real-time object detection. Tap it to toggle audio.",
			ar: "الأيقونة الخضراء بالسماعة هي لكتم أو تفعيل الصوت من الاكتشاف اللحظي. اضغط لتبديل الحالة.",
		},
		speech: {
			en: "The green icon with the speaker is for muting and unmuting audio feedback from the real-time object detection. Tap it to toggle audio.",
			ar: "الأيقونة الخضراء بالسماعة هي لكتم أو تفعيل الصوت من الاكتشاف اللحظي. اضغط لتبديل الحالة.",
		},
	},
	{
		key: "5",
		image: require("@/assets/tutorial/docscan.jpg"),
		title: { en: "Document Reading", ar: "قراءة المستندات" },
		content: {
			en: "The yellow icon with the document is for reading documents. Tap it to start reading text from documents in your camera view.",
			ar: "الأيقونة الصفراء بالمستند هي لقراءة المستندات. اضغط لبدء القراءة من عرض الكاميرا.",
		},
		speech: {
			en: "The yellow icon with the document is for reading documents. Tap it to start reading text from documents in your camera view.",
			ar: "الأيقونة الصفراء بالمستند هي لقراءة المستندات. اضغط لبدء القراءة من عرض الكاميرا.",
		},
	},
	{
		key: "6",
		image: require("@/assets/tutorial/describe.jpg"),
		title: { en: "Describe Scene", ar: "وصف المشهد" },
		content: {
			en: "The purple icon with the magnifying glass is for describing the scene. Tap it to get a description of your surroundings.",
			ar: "الأيقونة البنفسجية بالعدسة المكبرة لوصف المشهد. اضغط للحصول على وصف للمحيط.",
		},
		speech: {
			en: "The purple icon with the magnifying glass is for describing the scene. Tap it to get a description of your surroundings.",
			ar: "الأيقونة البنفسجية بالعدسة المكبرة لوصف المشهد. اضغط للحصول على وصف للمحيط.",
		},
	},
	{
		key: "7",
		image: require("@/assets/tutorial/llm.jpg"),
		title: { en: "Ask Anything!", ar: "اسأل أي شيء!" },
		content: {
			en: "The big orange icon with the mic is for our LLM powered vision assistant. Tap it to ask literally anything about your surroundings!",
			ar: "الأيقونة البرتقالية الكبيرة بالميكروفون هي للمساعد البصري الذكي. اضغط واسأل أي شيء حول محيطك!",
		},
		speech: {
			en: "The big orange icon with the mic is for our LLM powered vision assistant. Tap it to ask literally anything about your surroundings!",
			ar: "الأيقونة البرتقالية الكبيرة بالميكروفون هي للمساعد البصري الذكي. اضغط واسأل أي شيء حول محيطك!",
		},
	},
];

export default function TutorialScreen() {
	const language = useAppStore((state) => state.settings?.language || "en");
	const flatListRef = useRef<FlatList>(null);
	const [currentIndex, setCurrentIndex] = useState(0);

	const speakStep = (index: number) => {
		const step = tutorialSteps[index];
		if (step) {
			Speech.stop();
			Speech.speak(step.speech.en);
		}
	};

	useEffect(() => {
		speakStep(currentIndex);
	}, [currentIndex, language]);

	const handleNext = () => {
		if (currentIndex < tutorialSteps.length - 1) {
			const nextIndex = currentIndex + 1;
			flatListRef.current?.scrollToIndex({ index: nextIndex });
			setCurrentIndex(nextIndex);
		}
	};

	const handlePrev = () => {
		if (currentIndex > 0) {
			const prevIndex = currentIndex - 1;
			flatListRef.current?.scrollToIndex({ index: prevIndex });
			setCurrentIndex(prevIndex);
		}
	};

	return (
		<View style={styles.container}>
			<FlatList
				ref={flatListRef}
				data={tutorialSteps}
				horizontal
				pagingEnabled
				scrollEnabled={false}
				showsHorizontalScrollIndicator={false}
				renderItem={({ item }) => (
					<View style={styles.slide}>
						<Image source={item.image} style={styles.image} resizeMode='contain' />
						<Text style={styles.title}>{item.title[language]}</Text>
						<Text style={styles.content}>{item.content[language]}</Text>
					</View>
				)}
				keyExtractor={(item) => item.key}
			/>

			<View style={styles.nav}>
				<TouchableOpacity style={[styles.button, currentIndex === 0 && styles.disabled]} onPress={handlePrev} disabled={currentIndex === 0}>
					<Text style={styles.buttonText}>{language === "ar" ? "السابق" : "Previous"}</Text>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.button, currentIndex === tutorialSteps.length - 1 && styles.disabled]} onPress={handleNext} disabled={currentIndex === tutorialSteps.length - 1}>
					<Text style={styles.buttonText}>{language === "ar" ? "التالي" : "Next"}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},
	slide: {
		width,
		alignItems: "center",
		padding: 30,
	},
	image: {
		width: width * 0.8,
		height: height * 0.4,
		marginBottom: 24,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 12,
		textAlign: "center",
	},
	content: {
		fontSize: 18,
		textAlign: "center",
	},
	nav: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 20,
	},
	button: {
		backgroundColor: "#6750a4",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 20,
	},
	disabled: {
		opacity: 0.4,
	},
});
