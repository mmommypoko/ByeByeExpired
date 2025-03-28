import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image,
  ActivityIndicator, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageFridgeScreen = ({ navigation }) => {
  // State สำหรับเก็บคำค้นหา
  const [searchQuery, setSearchQuery] = useState("");
  // State สำหรับเก็บข้อมูลสินค้าในตู้เย็น
  const [products, setProducts] = useState([]);
  // State สำหรับตรวจสอบสถานะการโหลดข้อมูล
  const [loading, setLoading] = useState(true);
  // State สำหรับเก็บ user_id
  const [userId, setUserId] = useState(null);

  // useEffect สำหรับดึง user_id จาก AsyncStorage และดึงข้อมูลสินค้าในตู้เย็น
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // ดึง user_id จาก AsyncStorage
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
          // ดึงข้อมูลสินค้าในตู้เย็น
          fetchFridgeProducts(storedUserId);
        } else {
          console.log("No user ID found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  // ฟังก์ชันสำหรับดึงข้อมูลสินค้าในตู้เย็นจาก API
  const fetchFridgeProducts = async (userId) => {
    try {
      const response = await axios.get(
        `https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/get_fridge_items/${userId}`
      );
      // อัปเดต state products ด้วยข้อมูลที่ได้จาก API
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching fridge products:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลสินค้าได้");
    } finally {
      // ปิดสถานะการโหลด
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับนำทางไปหน้าเพิ่มสินค้า
  const handleAddProduct = () => {
    navigation.navigate("AddProduct");
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
        // อัปเดตข้อมูลสินค้าใน local state
        setProducts((prevProducts) =>
          prevProducts.map((item) =>
            item._id === productId ? { ...item, ...updatedProduct } : item
          )
        );
      },
    });
  };

  // ฟังก์ชันสำหรับกรองสินค้าตามคำค้นหา
  const filterProducts = (products, query) => {
    if (!query) {
      return products; // ถ้าไม่มีคำค้นหา ให้แสดงสินค้าทั้งหมด
    }

    // กรองสินค้าที่ชื่อเริ่มต้นด้วยคำค้นหา (ไม่สนใจตัวพิมพ์เล็ก-ใหญ่)
    return products.filter((product) =>
      product.name.toLowerCase().startsWith(query.toLowerCase())
    );
  };

  // แสดง ActivityIndicator หากกำลังโหลดข้อมูล
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#528DFF" />
      </View>
    );
  }

  return (
    // ใช้ LinearGradient สำหรับพื้นหลัง
    <LinearGradient colors={["#FFFFFF", "#FFB6C1"]} style={styles.container}>
      {/* ปุ่มกลับไปหน้า Overview */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Overview</Text>
      </TouchableOpacity>

      {/* หัวข้อหน้า */}
      <Text style={styles.header}>FRIDGE</Text>

      {/* ช่องค้นหาสินค้า */}
      <TextInput
        style={styles.searchBox}
        placeholder="Search Product"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* แสดงรายการสินค้าในรูปแบบ FlatList */}
      <FlatList
        data={filterProducts(products, searchQuery)} // กรองสินค้าตามคำค้นหา
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

      {/* ปุ่มเพิ่มสินค้า */}
      <View style={styles.addButtonContainer}>
        <View style={styles.addButtonBackground}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
            <View style={styles.addButtonCircle}>
              <Text style={styles.addButtonText}>+</Text>
            </View>
            <Text style={styles.addButtonLabel}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ปุ่มนำทางไปหน้า Login */}
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
    color: "#FE7EA9",
  },
  header: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FE7EA9",
    textAlign: "left",
    marginBottom: 10,
    paddingLeft: 10,
    marginTop: 10,
  },
  searchBox: {
    backgroundColor: "#e6e5e5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "flex-start",
  },
  addButtonBackground: {
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 20,
    paddingLeft: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FE7EA9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
  addButtonLabel: {
    color: "#FE7EA9",
    fontSize: 17,
    fontWeight: "bold",
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
});

export default StorageFridgeScreen;