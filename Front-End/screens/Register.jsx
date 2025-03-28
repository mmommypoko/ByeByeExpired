import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  // State สำหรับเก็บข้อมูลที่ผู้ใช้กรอก
  const [fullName, setFullName] = useState(''); // ชื่อเต็ม
  const [email, setEmail] = useState(''); // อีเมล
  const [password, setPassword] = useState(''); // รหัสผ่าน
  const [confirmPassword, setConfirmPassword] = useState(''); // ยืนยันรหัสผ่าน

  // ฟังก์ชันสำหรับการสมัครสมาชิก
  const handleRegister = async () => {
    // ตรวจสอบว่าทุกช่องถูกกรอกหรือไม่
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // ตรวจสอบรูปแบบอีเมลให้มีเครื่องหมาย "@"
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // ตรวจสอบว่า password และ confirmPassword ตรงกันหรือไม่
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // สร้าง object สำหรับส่งข้อมูลไปยัง backend
    const userData = {
      fullName: fullName,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    };

    // เชื่อมกับ Backend เพื่อตรวจสอบว่าอีเมลซ้ำหรือไม่
    try {
      const response = await fetch('https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      // หากสมัครสำเร็จ
      if (data.message === "User registered successfully") {
        // บันทึก user_id ลงใน AsyncStorage
        await AsyncStorage.setItem("user_id", data.user_id.toString()); // ✅ เก็บ user_id

        // แสดง user_id หลังสมัครสำเร็จ
        Alert.alert(
          "Success",
          `Registration successful!`,
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      } else if (data.message === "Email already exists") {
        // หากอีเมลซ้ำ
        Alert.alert(
          "Error",
          "Email is already registered!",
          [
            {
              text: "Try Again",
              onPress: () => {
                // เคลียร์ช่องกรอกข้อมูล
                setFullName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              },
            },
            { text: "Login", onPress: () => navigation.navigate("Login") },
          ],
          { cancelable: false }
        );
      } else {
        // หากเกิดข้อผิดพลาดอื่นๆ
        Alert.alert("Error", data.message || "An error occurred");
      }
    } catch (error) {
      // หากเกิดข้อผิดพลาดในการเชื่อมต่อ
      console.error("Error during registration:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  // State สำหรับตรวจสอบว่าคีย์บอร์ดแสดงอยู่หรือไม่
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // ฟังก์ชันเมื่อคีย์บอร์ดแสดงขึ้นมา
  const handleKeyboardShow = (event) => {
    setIsKeyboardVisible(true);
  };

  // ฟังก์ชันเมื่อคีย์บอร์ดหายไป
  const handleKeyboardHide = (event) => {
    setIsKeyboardVisible(false);
  };

  // useEffect สำหรับเพิ่ม event listener เมื่อคีย์บอร์ดแสดงหรือหายไป
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", handleKeyboardShow);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", handleKeyboardHide);

    // ลบ event listener เมื่อ component ถูกถอดออก
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    // ปิดคีย์บอร์ดเมื่อผู้ใช้แตะที่พื้นหลัง
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {/* KeyboardAvoidingView เพื่อเลื่อนฟอร์มขึ้นเมื่อคีย์บอร์ดแสดง */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        {/* พื้นหลังของหน้า */}
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.container}>
          {/* ปุ่มกลับไปหน้า Login */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          {/* ฟอร์มสมัครสมาชิก */}
          <View style={styles.formContainer}>
            {/* หัวข้อฟอร์ม */}
              <Text style={styles.headerText}>Create account</Text>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
            >
              {/* ช่องกรอกชื่อเต็ม */}
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
              />
              {/* ช่องกรอกอีเมล */}
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              {/* ช่องกรอกรหัสผ่าน */}
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {/* ช่องกรอกยืนยันรหัสผ่าน */}
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              {/* ปุ่มสมัครสมาชิก */}
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

// สไตล์สำหรับ component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 8,
    borderRadius: 15,
  },
  backButtonText: {
    fontSize: 14,
    color: "#6a367a",
  },
  formContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 80,
    marginTop: 200,
    paddingBottom: 30
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#aa64aa",
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    color: "#a64ca6",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e8b4e8",
  },
  button: {
    backgroundColor: "#ffe9f2",
    padding: 12,
    borderRadius: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 30,
    width: "90%",
    marginBottom:10,
    marginLeft:0 ,
    alignSelf: "center",
  },
  buttonText: {
    color: "#6a367a",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterScreen;