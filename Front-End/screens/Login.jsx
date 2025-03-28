import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUserID } from '../utils/storage';  // ตรวจสอบเส้นทางให้ถูกต้อง

// ประกาศ Functional Component ชื่อ LoginScreen รับ navigation ใช้เปลี่ยนหน้า App
const LoginScreen = ({ navigation }) => {
  // ประกาศ State ไว้ใช้สำหรับเก็บ email และ password 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ฟังก์ชันสำหรับการ Login
  const handleLogin = async () => {
    // ตรวจสอบว่า email และ password ไม่เป็นค่าว่างเปล่า
    if (!email || !password) {
      Alert.alert("Error", "Please fill in your full email and password.");
      return;
    }

    // สร้าง object เก็บ email และ passwordเพื่อใช้ในสำหรับส่งข้อมูลไปยัง back-end
    const loginData = { email, password };

    try {
      // ส่ง request ไปยัง back-end เพื่อทำการ Login
      // await ใช้เพื่อรอให้การส่ง request เสร็จสิ้นและได้รับ response จาก server.
      // fetch เป็นฟังก์ชันที่ใช้ส่ง HTTP request ไปยัง back-end
      // response คือ object ที่เก็บข้อมูลที่ได้จาก server หลังจากส่ง request
      const response = await fetch('https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/login', {
        method: 'POST', //HTTP method
        headers: { 'Content-Type': 'application/json' }, //ระบุว่าส่งข้อมูลไปในรูปแบบ JSON.
        body: JSON.stringify(loginData), // แปลง Object(loginData) เป็น JSON string เพื่อส่งไปยัง server.
      });

      // ตรวจสอบว่าการส่ง request ไปยัง server สำเร็จหรือไม่
      if (!response.ok) {
        const errorMessage = await response.text(); // response.text() เป็น method ที่ใช้สำหรับอ่านข้อมูลใน body ของ response และแปลงเป็น string
        console.log("Error Response:", errorMessage); // แสดงข้อความใน console ไม่สำเร็จเพราะ....

        try {
          // พยายามแปลง errorMessage เป็น JSON (หาก server ส่งกลับมาเป็น JSON)
          const data = JSON.parse(errorMessage);// กรณี errorMessage ถูกส่งมาจาก server ว่า Invalid email or password
          // ตรวจสอบว่า errorMessage ระบุว่า email หรือ password ไม่ถูกต้อง
          if (data.message === "Invalid email or password") {
            Alert.alert(
              "Error",
              "Invalid email or password",
              [
                {
                  text: "Try again",
                  onPress: () => console.log("Try again pressed"), // ผู้ใช้กด Try again
                  style: "cancel",
                },
                {
                  text: "Create an account",
                  onPress: () => navigation.navigate("Register"), // นำทางไปหน้า Register
                },
              ],
              { cancelable: false } // ป้องกันไม่ให้ผู้ใช้กดนอก alert เพื่อปิด
            );
            return; // เมื่อไม่สำเร็จให้ออกจากฟังก์ชัน handleLogin ทันที
          } else {
            // หาก error อื่น ๆ ให้แสดงข้อความ error ทั่วไป
            Alert.alert("Error", `Login failed: ${data.message || errorMessage}`);
            return;
          }
        } catch (error) {
          // หากแปลง errorMessage เป็น JSON ไม่ได้ (เช่น server ส่งกลับมาเป็น plain text)
          Alert.alert("Error", `Login failed: ${errorMessage}`);
          return;
        }
      } else {
        // กรณี response.ok เป็น true (สำเร็จ)
        try {
          // กรณีสำเร็จ
          // แปลง response เป็น JSON
          const data = await response.json(); // method นี้ใช้สำหรับแปลงข้อมูลใน body ของ response จากรูปแบบ JSON string เป็น JavaScript object.
          // แสดงข้อความผ่าน console ใช้เช็ค user_id ของผู้ใช้
          console.log("User Object:", data.user); // ใช้สำหรับพิมพ์ ข้อมูลผู้ใช้ (data.user) ลงใน console เพื่อช่วยในการ debug.

          // ตรวจสอบว่าการ Login สำเร็จและมีข้อมูล user 
          // data.massage เป็นข้อความที่ตอบกลับมาจาก server
          if (data.message === "Login successful" && data.user) {
            const userId = data.user.user_id;

            // ตรวจสอบว่าได้รับ user_id จาก server
            if (userId) {
              // บันทึก user_id ลงใน AsyncStorage ฟังก์ชัน setItem เพื่อทำการเก็บ user_id ไปใช้ต่อในโปรแกรม
              // AsyncStorage คือระบบเก็บข้อมูลแบบถาวร ในแอปพลิเคชัน React Native 
              // AsyncStorage ถูกออกแบบมาให้เก็บข้อมูลที่เป็น string เท่านั้น
              await AsyncStorage.setItem('user_id', userId.toString()); // เก็บค่า "userId.toString()" ไว้ที่ key "user_id" ต้องแปลงเป็น string 
              console.log("Logged in user_id:", userId);  // แสดง user_id ใน console
              Alert.alert("Success", `Login successful!`);
              navigation.navigate("Overview");
            } else {
              // กรณีไม่ได้รับ userId จาก server 
              console.log("No user_id received from the server.");
              Alert.alert("Error", "No user ID received. Please try again.");
            }
          } else {
            // หาก server ส่ง response กลับมาโดยไม่มี data.message หรือ data.user
            Alert.alert("Error", "Invalid email or password. Please try again.");
          }
        } catch (error) {
          console.error("Error during login:", error);
          Alert.alert("Error", "An error occurred. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  // State สำหรับตรวจสอบว่าคีย์บอร์ดแสดงอยู่หรือไม่
  const [isKeyboardVisible , setIsKeyboardVisible] = useState(false);

  // ฟังก์ชันเมื่อคีย์บอร์ดแสดง
  const handleKeyboardShow = (event) => {
    setIsKeyboardVisible(true);
  };

  // ฟังก์ชันเมื่อคีย์บอร์ดซ่อน
  const handleKeyboardHide = (event) => {
    setIsKeyboardVisible(false);
  };

  // ใช้ useEffect เพื่อเพิ่มและลบ event listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", handleKeyboardShow);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", handleKeyboardHide);

    // ลบ listeners เมื่อ component unmount
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    // TouchableWithoutFeedback สำหรับ dismiss คีย์บอร์ดเมื่อคลิกที่พื้นหลัง
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {/* KeyboardAvoidingView สำหรับจัดการ layout เมื่อคีย์บอร์ดแสดง */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        {/* ImageBackground สำหรับพื้นหลังของหน้า Login */}
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.container}>
          <Text style={styles.firstSubtitle}>
            <Text style={{ fontWeight: "bold", color: "#6c9de8" }}>Never waste food again! </Text>
            Our app reminds you of expiration dates and helps you manage your food,
            ensuring you use your ingredients before they go bad!
          </Text>
          <Text style={styles.subtitle}>_____________________________________</Text>
          
          <Text style={styles.title}>Log In</Text>
          {/* Form สำหรับกรอกข้อมูล Login */}
          <View style={styles.formContainer}>
            {/* Email */}
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
{/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {/* ปุ่มสำหรับ Login */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
              Don’t have an account yet?{" "}
              {/* ปุ่มสำหรับ register */}
              <Text
                style={styles.signUpText}
                onPress={() => navigation.navigate("Register")}
              >
                Create an account
              </Text>
            </Text>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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