import React, { useEffect } from "react";
import { View, Text, ImageBackground, StyleSheet, ActivityIndicator } from "react-native";

const LoadScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login"); // เปลี่ยนเป็นหน้า Login หลังจาก 2 วิ
    }, 2000);
  }, [navigation]);

  return (
    <ImageBackground source={require("../assets/images/load.png")} style={styles.background}>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.3)", // ทำให้ตัวหนังสืออ่านง่ายขึ้น
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
});

export default LoadScreen;
