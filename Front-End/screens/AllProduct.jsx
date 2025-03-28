import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, Image,
  ActivityIndicator, Alert, Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const AllProductScreen = ({ navigation }) => {
  // State สำหรับเก็บข้อมูลสินค้า
  const [products, setProducts] = useState([]);
  // State สำหรับตรวจสอบสถานะการโหลดข้อมูล
  const [loading, setLoading] = useState(true);
  // State สำหรับเก็บ user_id
  const [userId, setUserId] = useState(null);
  // State สำหรับเก็บลำดับการเรียงสินค้า ("asc" = เรียงจากน้อยไปมาก, "desc" = เรียงจากมากไปน้อย)
  const [sortOrder, setSortOrder] = useState("asc");

  // useEffect สำหรับดึง user_id จาก AsyncStorage และดึงข้อมูลสินค้า
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
          fetchProducts(storedUserId);
        } else {
          console.log("No user ID found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  // ฟังก์ชันสำหรับดึงข้อมูลสินค้าจาก API
  const fetchProducts = async (userId) => {
    try {
      const response = await axios.get(
        `https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/get_items/${userId}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Unable to fetch products"); // ✅ เปลี่ยนข้อความเป็นภาษาอังกฤษ
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับนำทางกลับไปหน้า Overview
  const handleGoBack = () => {
    navigation.navigate("Overview");
  };

  // ฟังก์ชันสำหรับนำทางไปหน้า Login
  const handleGoToNext = () => {
    navigation.navigate("Login");
  };

  // ฟังก์ชันสำหรับนำทางไปหน้าแสดงรายละเอียดสินค้า
  const handleProductPress = (product) => {
    navigation.navigate("ShowDetailProduct", {
      product,
      onUpdate: (productId, updatedProduct) => {
        // อัปเดตข้อมูลใน Local State
        setProducts((prevProducts) =>
          prevProducts.map((item) =>
            item._id === productId ? { ...item, ...updatedProduct } : item
          )
        );
      },
    });
  };

  // ฟังก์ชันสำหรับสลับลำดับการเรียงสินค้า
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  // เรียงลำดับสินค้าตามวันที่หมดอายุ
  const sortedProducts = sortProducts([...products], sortOrder);

  // แสดง ActivityIndicator หากกำลังโหลดข้อมูล
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#033495" />
      </View>
    );
  }

  return (
    // ใช้ LinearGradient สำหรับพื้นหลัง
    <LinearGradient colors={["#a4d2ff", "#FFFFFF"]} style={styles.container}>
      {/* ปุ่มกลับไปหน้า Overview */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Overview</Text>
      </TouchableOpacity>

      {/* หัวข้อหน้า */}
      <Text style={styles.header}>ALL PRODUCT</Text>

      {/* แสดงรายการสินค้าในรูปแบบ FlatList */}
      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item._id} // ใช้ _id เป็น key
        numColumns={2} // แสดงสินค้า 2 คอลัมน์
        columnWrapperStyle={styles.row} // จัดวางสินค้าในแต่ละแถว
        renderItem={({ item }) => (
          // การ์ดแสดงข้อมูลสินค้า
          <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(item)}>
            {/* รูปภาพสินค้า */}
            <Image source={{ uri: item.photo }} style={styles.productImage} />
            {/* ข้อมูลสินค้า */}
            <View style={styles.textBox}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
              <Text style={styles.productExpDate}>
                EXP: {new Date(item.expiration_date).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        // แสดงข้อความเมื่อไม่มีสินค้า
        ListEmptyComponent={<Text style={styles.emptyText}>No products available</Text>}
      />

      {/* ปุ่มนำทางไปหน้า Login */}
      <TouchableOpacity style={styles.rightArrowButton} onPress={handleGoToNext}>
        <View style={styles.rightArrowButtonCircle}>
          <Image
            source={require("../assets/images/exit.png")}
            style={{ width: 35, height: 35 }}
          />
        </View>
      </TouchableOpacity>

      {/* ปุ่มเรียงลำดับสินค้า */}
      <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
        <Ionicons
          name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </LinearGradient>
  );
};

// ฟังก์ชันสำหรับเรียงลำดับสินค้าตามวันที่หมดอายุ
const sortProducts = (products, order) => {
  return products.sort((a, b) => {
    const dateA = new Date(a.expiration_date);
    const dateB = new Date(b.expiration_date);
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
};

// สไตล์สำหรับ component
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
    color: "#033495",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#033495",
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
    width: width * 0.4, // ปรับขนาดให้เท่ากัน
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
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
  sortButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#033495",
    padding: 15,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default AllProductScreen;