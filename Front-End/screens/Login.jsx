import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUserID } from '../utils/storage';  // ตรวจสอบเส้นทางให้ถูกต้อง

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both fields");
      return;
    }
  
    const loginData = { email, password };
  
    try {
      const response = await fetch('https://bug-free-telegram-x5597wr5w69gc9qr9-5001.app.github.dev/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
  
      // เช็คว่า response.ok เป็น true หรือไม่
      if (!response.ok) {
        const errorMessage = await response.text();
        console.log("Error Response:", errorMessage);
        Alert.alert("Error", `Login failed: ${errorMessage}`);
        return;
      }
  
      const data = await response.json();
  
      // Debugging Logs
      console.log("Response data:", data);
      console.log("User Object:", data.user); // เช็ค user object
  
      // ตรวจสอบว่า login สำเร็จ
      if (data.message === "Login successful" && data.user) {
        const userId = data.user._id; // ใช้ _id แทน id
  
        if (userId) {
          // บันทึก user_id ลงใน AsyncStorage
          await setUserID(userId)
          console.log("Logged in _id:", userId);
          
          // แจ้งเตือนและนำทางไปยังหน้าต่อไป
          Alert.alert("Success", `Login successful! Your User ID: ${userId}`);
          navigation.navigate("Overview");
        } else {
          console.log("No _id received from the server.");
          Alert.alert("Error", "No user ID received. Please try again.");
        }
      } else {
        Alert.alert(
          "Error",
          "Invalid email or password. Please try again.",
          [
            { text: "Try Again", onPress: () => console.log("Try Again Pressed") },
            { text: "Create an account", onPress: () => navigation.navigate("Register") }
          ]
        );
      }
    } catch (error) {
      console.error("Error during login:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <ImageBackground source={require("../assets/images/background.jpg")} style={styles.container}>
      <Text style={styles.firstSubtitle}>
        <Text style={{ fontWeight: "bold", color: "#6c9de8" }}>Never waste food again! </Text>
        Our app reminds you of expiration dates and helps you manage your food,
        ensuring you use your ingredients before they go bad!
      </Text>
      <Text style={styles.subtitle}>________________________________________</Text>
      <Text style={styles.title}>Log In</Text>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Don’t have an account yet?{" "}
          <Text 
            style={styles.signUpText} 
            onPress={() => navigation.navigate("Register")}
          >
            Create an account
          </Text>
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    color: "#aa64aa",
    fontWeight: "600",
    marginBottom: 10,
  },
  firstSubtitle: {
    fontSize: 16,
    textAlign: "left",
    color: "#d59ac5",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "left",
    color: "#d59ac5",
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 15,
  },
  label: {
    fontSize: 14,
    color: "#a64ca6",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f1d4e4",
  },
  button: {
    backgroundColor: "#ffe9f2",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 30,
  },
  buttonText: {
    color: "#6a367a",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 15,
    textAlign: "center",
    color: "#6a367a",
  },
  signUpText: {
    color: "#e81b7e",
    fontWeight: "bold",
  },
});

export default LoginScreen;