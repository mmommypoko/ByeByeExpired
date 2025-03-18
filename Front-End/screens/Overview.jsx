import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AddProductScreen from "./AddProduct"; // นำเข้าหน้า Add Product
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const nearlyExpiredData = [
  { id: "1", name: "เอโร่ ไข่ไก่ เบอร์ 3", image: require("../assets/images/egg.png") },
  { id: "2", name: "ลูกชิ้นปลากลม", image: require("../assets/images/egg.png") },
  { id: "3", name: "น้ำมะนาวคั้นสด", image: require("../assets/images/egg.png") },
  { id: "4", name: "ไก่หมักกล้วยแช่แข็ง", image: require("../assets/images/egg.png") },
  { id: "5", name: "เลือดไก่", image: require("../assets/images/egg.png") },
];

const expiredData = [
  { id: "1", name: "เครื่องในไก่", image: require("../assets/images/egg.png") },
  { id: "2", name: "เลือดไก่", image: require("../assets/images/egg.png") },
  { id: "3", name: "ไก่หมักกล้วยแช่แข็ง", image: require("../assets/images/egg.png") },
  { id: "4", name: "น้ำมะนาวคั้นสด", image: require("../assets/images/egg.png") },
  { id: "5", name: "ลูกชิ้นปลากลม", image: require("../assets/images/egg.png") },
];

// ตัวอย่างข้อมูลที่เก็บรายการอาหารในแต่ละประเภท
const fridgeItems = ["Cheese", "Butter", "Yogurt"];
const freezerItems = ["Ice cream", "Frozen peas", "Frozen pizza"];
const dryFoodItems = ["Pasta", "Rice", "Cereal"];

const storage = [
  { name: "Fridge", count: fridgeItems.length, image: require("../assets/images/fridge.png"), screen: "StorageFridge" },
  { name: "Freezer", count: freezerItems.length, image: require("../assets/images/freezer.png"), screen: "StorageFreezer" },
  { name: "Dry food", count: dryFoodItems.length, image: require("../assets/images/dryFood.png"), screen: "StorageDryFood" },
];


export default function App() {
  const [currentDate, setCurrentDate] = useState("");
  const navigation = useNavigation();
  const [nearlyExpired, setNearlyExpired] = useState([]);  // กำหนด useState ที่นี่
  const [expired, setExpired] = useState([]);  // กำหนด useState ที่นี่
  const [userId, setUserId] = useState(null);


  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-GB").replace(/\//g, "-");
    setCurrentDate(formattedDate);
    setNearlyExpired(nearlyExpiredData.slice(0, 5));
    setExpired(expiredData.slice(0, 5));

  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
  
    fetchUserId();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F6FB", padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, marginTop: 5 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#4D5A9C",
              borderRadius: 50,
              padding: 8,
              width: 35,
              height: 35,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000", // สีเงา
              shadowOffset: { width: 0, height: 2 }, // การกระจายเงา
              shadowOpacity: 0.1, // ความเข้มของเงา
              shadowRadius: 3, // ความฟุ้งของเงา
              elevation: 4,
            }}
          >
            <Image
              source={require("../assets/images/calendar icon.png")}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>

          <View
            style={{
              backgroundColor: "white",
              borderRadius: 50,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginLeft: 10,
              shadowColor: "#000", // สีเงา
              shadowOffset: { width: 0, height: 1 }, // การกระจายเงา
              shadowOpacity: 0.1, // ความเข้มของเงา
              shadowRadius: 3, // ความฟุ้งของเงา
              elevation: 4, // ใช้สำหรับ Android
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#4D5A9C" }}>
              {currentDate}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#FFF",
            borderRadius: 50,
            padding: 8,
            width: 35,
            height: 35,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 4,
          }}
          onPress={() => navigation.navigate("Login")} // เพิ่มการนำทางไปหน้า Login
        >
          <Image
            source={require("../assets/images/exit.png")}
            style={{ width: 35, height: 35 }}
          />
        </TouchableOpacity>

      </View>

      <ScrollView>
        {/* Nearly Expired Section */}
        <View style={{ marginVertical: 10, marginTop: 30 }}>
          <LinearGradient colors={["#FEC2D6", "#FEE5E1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 8, borderRadius: 30 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={require("../assets/images/N.png")} style={{ width: 25, height: 25, marginRight: 8 }} />
              <Text style={{ fontWeight: "bold", fontSize: 16, color: "#E72828" }}>Nearly expired</Text>
            </View>
          </LinearGradient>
          <View style={{ backgroundColor: "#FCFCFF", borderRadius: 20, padding: 15, marginTop: 10, height: 120, elevation: 5 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {nearlyExpired.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigation.navigate("NearlyExpired", { productId: item.id, userId })} // เพิ่มการนำทางที่นี่
                >
                  <View key={item.id} style={{ backgroundColor: "#FFEBEB", borderRadius: 10, padding: 15, marginRight: 10, width: 90, height: 90, justifyContent: "center", alignItems: "center" }}>
                    <Image source={item.image} style={{ width: 50, height: 50, marginTop: 10 }} />
                    <Text style={{ fontSize: 10, color: "#7C0A0A", textAlign: "center", marginBottom: 10 }}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Expired Section */}
        <View style={{ marginVertical: 10, marginTop: 20 }}>
          <LinearGradient colors={["#EBDC9E", "#FFF2D6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 8, borderRadius: 30 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={require("../assets/images/E.png")} style={{ width: 25, height: 25, marginRight: 8 }} />
              <Text style={{ fontWeight: "bold", fontSize: 16, color: "#7C0A0A" }}>Expired</Text>
            </View>
          </LinearGradient>
          <View style={{ backgroundColor: "#FCFCFF", borderRadius: 20, padding: 15, marginTop: 10, height: 120, elevation: 5 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {expired.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigation.navigate("Expired", { productId: item.id })} // เพิ่มการนำทางที่นี่
                >
                  <View key={item.id} style={{ backgroundColor: "#FFEBEB", borderRadius: 10, padding: 15, marginRight: 10, width: 90, height: 90, justifyContent: "center", alignItems: "center" }}>
                    <Image source={item.image} style={{ width: 50, height: 50, marginTop: 10 }} />
                    <Text style={{ fontSize: 10, color: "#7C0A0A", textAlign: "center", marginBottom: 10 }}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ marginVertical: 10, marginTop: 20 }}>
            <LinearGradient
              colors={["#BBE9FF", "#E1FCFE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ padding: 8, borderRadius: 30 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={require("../assets/images/S.png")}
                  style={{ width: 25, height: 25, marginRight: 8 }}
                />
                <Text style={{ fontWeight: "bold", fontSize: 16, color: "#263DD3" }}>
                  Storage
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={{ margin: 10, marginBottom: 130 }}>
          <Card style={{ padding: 1, borderRadius: 30, overflow: "hidden" }}>
            {storage.map((item, idx) => (
              <TouchableOpacity key={idx} onPress={() => navigation.navigate(item.screen)}>
                <View style={{ flexDirection: "row", alignItems: "center", padding: 1, borderBottomWidth: idx !== storage.length - 1 ? 1 : 0, borderBottomColor: "#E0E0E0" }}>
                  <Image source={item.image} style={{ width: 55, height: 55, marginRight: 1 }} />
                  <Text style={{ fontSize: 16, fontWeight: "normal", flex: 1 }}>
                    {item.name}
                  </Text>
                  <View style={{
                    backgroundColor: "#6C74FF",
                    borderRadius: 50,
                    width: 20,
                    height: 20,
                    marginRight: 20,
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    <Text style={{ color: "white", fontWeight: "normal", fontSize: 12 }}>
                      {item.count}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      </ScrollView>

      {/*bottom*/}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 0, marginTop: 0 }}>
        <View
          style={{
            position: "absolute",
            bottom: -290, // ขยับลงมาเพื่อให้โค้งลอยขึ้นมา
            left: -210,
            right: -210,
            height: 350, // เพิ่มความสูงเพื่อให้ขอบบนโค้งขึ้น
            backgroundColor: "#FFF",
            borderTopLeftRadius: 500, // เพิ่มความโค้งมากขึ้น
            borderTopRightRadius: 500,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
            elevation: 15,
            justifyContent: "center", // จัดกลางแนวตั้ง
            alignItems: "center", // จัดกลางแนวนอน
          }}
        />

        <View
          style={{
            position: "absolute",
            bottom: 0, // ตั้งตำแหน่งที่ด้านล่างของหน้าจอ
            width: "100%", // ทำให้ครอบคลุมพื้นที่ทั้งหมด
            flexDirection: "row", // จัดปุ่มในแนวนอน
            justifyContent: "space-evenly", // ให้ปุ่มห่างกันเท่ากัน
            paddingHorizontal: 0, // เพิ่มระยะห่างจากขอบซ้ายและขวา
            alignItems: "center", // จัดปุ่มให้อยู่กลางแนวตั้ง
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("AllProduct")}
          >
            <Image source={require("../assets/images/button1.png")} style={{ width: 22, height: 22 }} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("NearlyExpired")}
          >
            <Image source={require("../assets/images/button2.png")} style={{ width: 27, height: 27 }} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Expired")}
          >
            <Image source={require("../assets/images/button3.png")} style={{ width: 27, height: 27 }} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
          >
            <Image source={require("../assets/images/button4.png")} style={{ width: 22, height: 22 }} />
          </TouchableOpacity>
        </View>

      </View>
      <View>
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 40, // ระยะห่างจากด้านล่าง
            alignSelf: "center", // จัดปุ่มให้อยู่กลางแนวนอน
            backgroundColor: "#6C74FF", // สีของปุ่ม
            borderRadius: 50, // ทำให้เป็นวงกลม
            padding: 4, // ลดความห่างภายในให้เล็กลง
            height: 45, // กำหนดความสูงให้เล็กลง
            width: 45, // กำหนดความกว้างให้เล็กลง
            justifyContent: "center", // จัดตำแหน่งเนื้อหากลางแนวตั้ง
            alignItems: "center", // จัดตำแหน่งเนื้อหากลางแนวนอน
          }}
          onPress={() => navigation.navigate("AddProduct")} // นำทางไปหน้าที่ต้องการ
        >
          <Text style={{ fontSize: 28, fontWeight: 'normal', color: 'white', textAlign: "center" }}>+</Text>
        </TouchableOpacity>
      </View>
    </View >
  );
}
import NearlyExpired from "./NearlyExpired";
import Expired from "./Expired";
