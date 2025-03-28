import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

export default function App() {
  // State สำหรับเก็บวันที่ปัจจุบัน
  const [currentDate, setCurrentDate] = useState("");
  // Hook สำหรับการนำทางระหว่างหน้า
  const navigation = useNavigation();
  // State สำหรับเก็บรายการสินค้าใกล้หมดอายุ
  const [nearlyExpired, setNearlyExpired] = useState([]);
  // State สำหรับเก็บรายการสินค้าหมดอายุ
  const [expired, setExpired] = useState([]);
  // State สำหรับเก็บ user_id
  const [userId, setUserId] = useState(null);
  // State สำหรับเก็บข้อมูลพื้นที่เก็บสินค้า
  const [storage, setStorage] = useState([
    { name: "Fridge", count: 0, image: require("../assets/images/fridge.png"), screen: "StorageFridge" },
    { name: "Freezer", count: 0, image: require("../assets/images/freezer.png"), screen: "StorageFreezer" },
    { name: "Dry food", count: 0, image: require("../assets/images/dryFood.png"), screen: "StorageDryFood" },
  ]);

  // ตั้งค่าวันที่ปัจจุบันเมื่อ component ถูกโหลด
  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-GB").replace(/\//g, "-");
    setCurrentDate(formattedDate);
  }, []);

  // ดึง user_id จาก AsyncStorage เมื่อ component ถูกโหลด
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    };
    fetchUserId();
  }, []);

  // ดึงข้อมูลสินค้าใกล้หมดอายุและหมดอายุเมื่อ user_id เปลี่ยนแปลง
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userId) {
          // ดึงข้อมูลสินค้าใกล้หมดอายุ
          const nearlyExpiredResponse = await axios.get(`https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/get_nearly_expired_items/${userId}`);
          setNearlyExpired(nearlyExpiredResponse.data);

          // ดึงข้อมูลสินค้าหมดอายุ
          const expiredResponse = await axios.get(`https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/get_expired_items/${userId}`);
          setExpired(expiredResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [userId]);

  // ดึงข้อมูลจำนวนสินค้าในแต่ละพื้นที่เก็บเมื่อ user_id เปลี่ยนแปลง
  useEffect(() => {
    const fetchStorageCounts = async () => {
      try {
        if (userId) {
          // ดึงข้อมูลจำนวนสินค้าใน Fridge
          const fridgeResponse = await axios.get(`https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/get_fridge_items/${userId}`);
          const fridgeCount = fridgeResponse.data.length;

          // ดึงข้อมูลจำนวนสินค้าใน Freezer
          const freezerResponse = await axios.get(`https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/get_freezer_items/${userId}`);
          const freezerCount = freezerResponse.data.length;

          // ดึงข้อมูลจำนวนสินค้าใน Dry Food
          const dryFoodResponse = await axios.get(`https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/get_dry_food_items/${userId}`);
          const dryFoodCount = dryFoodResponse.data.length;

          // อัปเดต state storage
          setStorage([
            { name: "Fridge", count: fridgeCount, image: require("../assets/images/fridge.png"), screen: "StorageFridge" },
            { name: "Freezer", count: freezerCount, image: require("../assets/images/freezer.png"), screen: "StorageFreezer" },
            { name: "Dry food", count: dryFoodCount, image: require("../assets/images/dryFood.png"), screen: "StorageDryFood" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching storage counts:", error);
      }
    };
    fetchStorageCounts();
  }, [userId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F6FB", padding: 20 }}>
      {/* Header Section */}
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 4,
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
          onPress={() => navigation.navigate("Login")}
        >
          <Image
            source={require("../assets/images/exit.png")}
            style={{ width: 35, height: 35 }}
          />
        </TouchableOpacity>
      </View>

      {/* Nearly Expired Section */}
      <ScrollView>
        <View style={{ marginVertical: 10, marginTop: 30 }}>
          <LinearGradient colors={["#FEC2D6", "#FEE5E1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 8, borderRadius: 30 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={require("../assets/images/N.png")} style={{ width: 25, height: 25, marginRight: 8 }} />
              <Text style={{ fontWeight: "bold", fontSize: 16, color: "#E72828" }}>Nearly expired</Text>
            </View>
          </LinearGradient>
          <View style={{ backgroundColor: "#FCFCFF", borderRadius: 20, padding: 15, marginTop: 10, height: 120, elevation: 5 }}>
            {nearlyExpired.length === 0 ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: "#7C0A0A" }}>There are no products.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {nearlyExpired.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => navigation.navigate("NearlyExpired", { productId: item._id, userId })}
                  >
                    <View style={{ backgroundColor: "#FFEBEB", borderRadius: 10, padding: 15, marginRight: 10, width: 90, height: 90, justifyContent: "center", alignItems: "center" }}>
                      <Image source={{ uri: item.photo }} style={{ width: 50, height: 50, marginTop: 10 }} />
                      <Text style={{ fontSize: 10, color: "#7C0A0A", textAlign: "center", marginBottom: 10 }}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
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
            {expired.length === 0 ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: "#7C0A0A" }}>There are no products.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {expired.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => navigation.navigate("Expired", { productId: item._id })}
                  >
                    <View style={{ backgroundColor: "#FFEBEB", borderRadius: 10, padding: 15, marginRight: 10, width: 90, height: 90, justifyContent: "center", alignItems: "center" }}>
                      <Image source={{ uri: item.photo }} style={{ width: 50, height: 50, marginTop: 10 }} />
                      <Text style={{ fontSize: 10, color: "#7C0A0A", textAlign: "center", marginBottom: 10 }}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Storage Section */}
        <View style={{ marginVertical: 10, marginTop: 20 }}>
          <LinearGradient colors={["#BBE9FF", "#E1FCFE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 8, borderRadius: 30 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={require("../assets/images/S.png")} style={{ width: 25, height: 25, marginRight: 8 }} />
              <Text style={{ fontWeight: "bold", fontSize: 16, color: "#263DD3" }}>Storage</Text>
            </View>
          </LinearGradient>
          <View style={{ margin: 10, marginBottom: 130 }}>
            <Card style={{ padding: 1, borderRadius: 30, overflow: "hidden" }}>
              {storage.map((item, idx) => (
                <TouchableOpacity key={idx} onPress={() => navigation.navigate(item.screen)}>
                  <View style={{ flexDirection: "row", alignItems: "center", padding: 1, borderBottomWidth: idx !== storage.length - 1 ? 1 : 0, borderBottomColor: "#E0E0E0" }}>
                    <Image source={item.image} style={{ width: 55, height: 55, marginRight: 1 }} />
                    <Text style={{ fontSize: 16, fontWeight: "normal", flex: 1 }}>{item.name}</Text>
                    <View style={{ backgroundColor: "#6C74FF", borderRadius: 50, width: 20, height: 20, marginRight: 20, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ color: "white", fontWeight: "normal", fontSize: 12 }}>{item.count}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 0, marginTop: 0 }}>
        <View
          style={{
            position: "absolute",
            bottom: -290,
            left: -210,
            right: -210,
            height: 350,
            backgroundColor: "#FFF",
            borderTopLeftRadius: 500,
            borderTopRightRadius: 500,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
            elevation: 15,
            justifyContent: "center",
            alignItems: "center",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-evenly",
            paddingHorizontal: 0,
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate("AllProduct")}>
            <Image source={require("../assets/images/button1.png")} style={{ width: 22, height: 22 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("NearlyExpired")}>
            <Image source={require("../assets/images/button2.png")} style={{ width: 27, height: 27 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Expired")}>
            <Image source={require("../assets/images/button3.png")} style={{ width: 27, height: 27 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image source={require("../assets/images/button4.png")} style={{ width: 22, height: 22 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Product Button */}
      <View>
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 40,
            alignSelf: "center",
            backgroundColor: "#6C74FF",
            borderRadius: 50,
            padding: 4,
            height: 45,
            width: 45,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => navigation.navigate("AddProduct")}
        >
          <Text style={{ fontSize: 28, fontWeight: 'normal', color: 'white', textAlign: "center" }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}