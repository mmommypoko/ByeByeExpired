import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, Image,
  ActivityIndicator, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// ExpProductScreen คอมโพเนนต์สำหรับแสดงสินค้าที่หมดอายุ
const ExpProductScreen = ({ navigation }) => {
  // State สำหรับเก็บรายการสินค้าที่หมดอายุ
  const [products, setProducts] = useState([]);
  // State สำหรับจัดการสถานะการโหลดข้อมูล
  const [loading, setLoading] = useState(true);
  // State สำหรับเก็บ ID ของผู้ใช้
  const [userId, setUserId] = useState(null);

  // useEffect สำหรับดึง ID ผู้ใช้จาก AsyncStorage และดึงข้อมูลสินค้าที่หมดอายุ
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // ดึง ID ผู้ใช้จาก AsyncStorage
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
          // ดึงข้อมูลสินค้าที่หมดอายุโดยใช้ ID ผู้ใช้
          fetchExpiredProducts(storedUserId);
        } else {
          console.log("ไม่พบ ID ผู้ใช้ใน AsyncStorage");
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึง ID ผู้ใช้จาก AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  // ฟังก์ชันสำหรับดึงข้อมูลสินค้าที่หมดอายุจากเซิร์ฟเวอร์
  const fetchExpiredProducts = async (userId) => {
    try {
      const response = await axios.get(
        `https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/get_expired_items/${userId}`
      );
      // อัปเดตรายการสินค้าที่หมดอายุใน state
      setProducts(response.data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าที่หมดอายุ:", error);
      // แสดง Alert หากเกิดข้อผิดพลาดในการดึงข้อมูล
      Alert.alert("Error", "ไม่สามารถดึงข้อมูลสินค้าที่หมดอายุได้");
    } finally {
      // ตั้งค่า loading เป็น false เมื่อการดึงข้อมูลเสร็จสิ้น
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับกลับไปยังหน้า Overview
  const handleGoBack = () => {
    navigation.navigate("Overview");
  };

  // ฟังก์ชันสำหรับไปยังหน้า Login
  const handleGoToNext = () => {
    navigation.navigate("Login");
  };

  // ฟังก์ชันสำหรับเมื่อผู้ใช้กดที่สินค้า เพื่อไปยังหน้าดูรายละเอียดสินค้า
  const handleProductPress = (product) => {
    navigation.navigate("ShowDetailProduct", {
      product,
      onUpdate: (productId, updatedProduct) => {
        // อัปเดตข้อมูลสินค้าใน state
        setProducts((prevProducts) =>
          prevProducts.map((item) =>
            item._id === productId ? { ...item, ...updatedProduct } : item
          )
        );
      },
    });
  };

  // แสดง Loading Indicator หากกำลังโหลดข้อมูล
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#de4f4f", "#FFFFFF"]} style={styles.container}>
      {/* ปุ่มกลับไปยังหน้า Overview */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Overview</Text>
      </TouchableOpacity>
      {/* หัวข้อของหน้าจอ */}
      <Text style={styles.header}>EXPIRED</Text>
      {/* FlatList สำหรับแสดงรายการสินค้าที่หมดอายุ */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(item)}>
            {/* รูปภาพสินค้า */}
            <Image source={{ uri: item.photo }} style={styles.productImage} />
            <View style={styles.textBox}>
              {/* ชื่อสินค้า */}
              <Text style={styles.productName}>{item.name}</Text>
              {/* จำนวนสินค้า */}
              <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
              {/* วันที่หมดอายุ */}
              <Text style={styles.productExpDate}>
                EXP: {new Date(item.expiration_date).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        // แสดงข้อความหากไม่มีสินค้าที่หมดอายุ
        ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีสินค้าที่หมดอายุ</Text>}
      />
      {/* ปุ่มสำหรับไปยังหน้า Login */}
      <TouchableOpacity style={styles.rightArrowButton} onPress={handleGoToNext}>
        <View style={styles.rightArrowButtonCircle}>
          <Image
            source={require("../assets/images/exit.png")}
            style={{ width: 35, height: 35 }}
          />
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

// สไตล์สำหรับคอมโพเนนต์
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
    padding: 10,
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "#ffffff",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
    paddingLeft: 10,
    marginTop: 10,
  },
  row: {
    justifyContent: "space-between",
  },
  productCard: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginBottom: 15,
    marginHorizontal: 10,
    width: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 145,
    height: 120,
    resizeMode: "contain",
    borderRadius: 8,
  },
  textBox: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
    width: "100%",
    alignItems: "flex-start",
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  productQuantity: {
    fontSize: 12,
    color: "#555",
  },
  productExpDate: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#D9534F",
  },
  rightArrowButton: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  rightArrowButtonCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555",
  },
});

export default ExpProductScreen;