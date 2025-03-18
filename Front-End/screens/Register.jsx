import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    // ตรวจสอบข้อมูลที่กรอก
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
  
    const userData = {
      fullName: fullName,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    };
  
    // เชื่อมกับ Backend เพื่อตรวจสอบว่าอีเมลซ้ำหรือไม่
    try {
      const response = await fetch('https://bug-free-telegram-x5597wr5w69gc9qr9-5001.app.github.dev/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
  
      if (data.message === "User registered successfully") {
        // เช็คว่าได้รับ user_id หรือไม่
        if (data.user_id) {
          // แปลง user_id เป็น integer และเก็บใน AsyncStorage
          await AsyncStorage.setItem("user_id", data.user_id.toString()); // เก็บเป็น string แต่เป็นตัวเลขที่แปลงมา
        }
        Alert.alert("Success", "Registration successful!");
        navigation.navigate("Login");
      } else if (data.message === "Email already exists") {
        Alert.alert(
          "Error",
          "Email is already registered!",
          [
            {
              text: "Try Again",
              onPress: () => {
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
        Alert.alert("Error", data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <ImageBackground source={require("../assets/images/background.jpg")} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.formContainer}>
        <Text style={styles.headerText}>Create account</Text>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />
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
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
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
    paddingBottom: 30,
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
    backgroundColor: "#ffe9f2",//"#f5f5f5",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",//"#d9a9d9",
    shadowOffset: { width: 0, height: 4 },//{ width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 30,
  },
  buttonText: {
    color: "#6a367a",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterScreen;