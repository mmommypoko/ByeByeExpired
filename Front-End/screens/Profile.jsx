import React, { useState, useEffect } from "react";
import { 
  View, Text, Image, TouchableOpacity, 
  StyleSheet, ImageBackground, Dimensions, TextInput, 
  TouchableWithoutFeedback, Keyboard, Alert 
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false); 
  const [userId, setUserId] = useState(null); // เพิ่ม state สำหรับ userId
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // ดึง user_id จาก AsyncStorage
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
          fetchUserData(storedUserId);
        } else {
          console.log("No user ID found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  const fetchUserData = (userId) => {
    if (userId) {
      console.log("Sending userId:", userId);
      axios.get(`https://bug-free-telegram-x5597wr5w69gc9qr9-5001.app.github.dev/get_user/${userId}`)
        .then(response => {
          console.log("API Response:", response.data);
          setName(response.data.name);
          setEmail(response.data.email);
        })
        .catch(error => {
          console.error("API Error:", error.response ? error.response.data : error.message);
          if (error.response && error.response.data.message === "User not found") {
            Alert.alert("ไม่พบผู้ใช้", "ไม่มีข้อมูลผู้ใช้ที่ตรงกับ userId นี้");
          } else {
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลผู้ใช้ได้");
          }
        });
    }
  };

  // ฟังก์ชันบันทึกชื่อที่แก้ไข
  const saveName = async () => {
    if (!userId) {
      Alert.alert("ข้อมูลไม่ครบถ้วน", "ไม่พบ userId");
      return;
    }
    try {
      await axios.put('https://bug-free-telegram-x5597wr5w69gc9qr9-5001.app.github.dev/update_name', {
        user_id: userId,
        name: name,
      });
      Alert.alert("สำเร็จ", "ชื่อของคุณถูกอัปเดตแล้ว");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตชื่อได้");
    }
  };

  // ฟังก์ชันสำหรับลบบัญชี
  const deleteAccount = async () => {
    if (!userId) {
      Alert.alert("ข้อมูลไม่ครบถ้วน", "ไม่พบ userId");
      return;
    }
  
    // แสดงการแจ้งเตือนก่อนทำการลบบัญชี
    Alert.alert(
      "ลบบัญชี",
      "คุณแน่ใจหรือว่าต้องการลบบัญชีนี้? การลบไม่สามารถกู้คืนได้.",
      [
        { text: "ยกเลิก" },
        { 
          text: "ลบบัญชี", 
          onPress: async () => {
            try {
              // ส่ง request ลบบัญชี
              const response = await axios.delete('https://bug-free-telegram-x5597wr5w69gc9qr9-5001.app.github.dev/delete_account', {
                data: { user_id: userId },
              });
              if (response.status === 200) {
                Alert.alert('บัญชีของคุณถูกลบเรียบร้อยแล้ว');
                navigation.navigate("Login"); // กลับไปที่หน้าล็อกอินหลังลบบัญชี
              }
            } catch (error) {
              console.error(error);
              Alert.alert('เกิดข้อผิดพลาดในการลบบัญชี');
            }
          }
        },
      ]
    );
  };

  const handleOutsidePress = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <ImageBackground 
        source={require("../assets/images/background profile.png")} 
        style={styles.background}
      >
        <Image 
          source={require("../assets/images/ground profile.png")} 
          style={styles.profileBackground} 
        />

        <View style={styles.myProfileContainer}>
          <Text style={styles.myProfileText}>My Profile</Text>
        </View>

        <TouchableOpacity 
          style={styles.topRightButton} 
          onPress={() => navigation.navigate("Overview")}
        >
          <Image 
            source={require("../assets/images/home.png")} 
            style={styles.topRightIcon} 
          />
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          <Image 
            source={require("../assets/images/profile11.png")} 
            style={styles.profileImage} 
          />

          <View style={styles.nameContainer}>
            {isEditing ? (
              <TextInput
                style={styles.profileName}
                value={name}
                onChangeText={setName}
                autoFocus
                onSubmitEditing={saveName}
              />
            ) : (
              <Text style={styles.profileName}>{name}</Text>
            )}

            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
              <Image 
                source={require("../assets/images/Pen3.png")}
                style={styles.editIcon} 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        <TouchableOpacity 
          style={styles.LogOutButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>

        {/* ปุ่มลบบัญชี */}
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={deleteAccount}
        >
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBackground: {
    position: "absolute",
    top: 120,
    right: -5,
    width: width,
    height: width * 0.5,
    resizeMode: "contain",
  },
  myProfileContainer: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#ffe9f2",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  myProfileText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6a367a",
  },
  topRightButton: {
    position: "absolute",
    top: 40,
    right: 25,
    width: 46,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  topRightIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  profileContainer: {
    position: "absolute",
    top: width * 0.2,
    width: "85%",
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: 135,
    height: 120,
    borderRadius: 60,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  profileName: {
    fontSize: 22,
    left: 20,
    fontWeight: "bold",
    color: "#6D3B76",
  },
  editButton: {
    padding: -4,
  },
  editIcon: {
    left: 25,
    width: 22,
    height: 20,
    resizeMode: "contain",
  },
  profileEmail: {
    fontSize: 14,
    left: 9,
    color: "#666",
    marginTop: 6,
  },
  LogOutButton: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#ffe9f2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#6a367a",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    position: "absolute",
    bottom: 80,
    right: 25,
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;