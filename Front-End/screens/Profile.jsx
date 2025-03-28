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
  // State สำหรับเก็บชื่อผู้ใช้
  const [name, setName] = useState("");
  // State สำหรับเก็บอีเมลผู้ใช้
  const [email, setEmail] = useState("");
  // State สำหรับตรวจสอบสถานะการแก้ไขชื่อ
  const [isEditing, setIsEditing] = useState(false); 
  // State สำหรับเก็บ user_id
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  // useEffect สำหรับดึง user_id จาก AsyncStorage และดึงข้อมูลผู้ใช้
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // ดึง user_id จาก AsyncStorage
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedUserId) {
          setUserId(storedUserId);
          fetchUserData(storedUserId); // เรียกฟังก์ชันดึงข้อมูลผู้ใช้
        } else {
          console.log("No user ID found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };
  
    fetchUserId();
  }, []);
  
  // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้จาก API
  const fetchUserData = (userId) => {
    if (userId) {
      axios.get(`https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/get_user/${userId}`)
        .then(response => {
          setName(response.data.name);
          setEmail(response.data.email);
        })
        .catch(error => {
          console.error("API Error:", error.response ? error.response.data : error.message);
          if (error.response && error.response.data.message === "User not found") {
            Alert.alert("User Not Found", "No user data found for this userId"); // ✅ เปลี่ยนข้อความเป็นภาษาอังกฤษ
          } else {
            Alert.alert("Error", "Unable to fetch user data"); // ✅ เปลี่ยนข้อความเป็นภาษาอังกฤษ
          }
        });
    }
  };

  // ฟังก์ชันบันทึกชื่อที่แก้ไข
  const saveName = async () => {
    if (!userId) {
      Alert.alert("Incomplete Data", "userId not found"); // ✅ เปลี่ยนข้อความเป็นภาษาอังกฤษ
      return;
    }
    try {
      await axios.put('https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/update_name', {
        user_id: userId,
        name: name,
      });
      Alert.alert("Success", "Your name has been updated"); // ✅ เปลี่ยนข้อความเป็นภาษาอังกฤษ
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to update name"); // ✅ เปลี่ยนข้อความเป็นภาษาอังกฤษ
    }
  };

  // ฟังก์ชันสำหรับลบบัญชี
  const deleteAccount = async () => {
    if (!userId) {
      Alert.alert("Incomplete Data", "userId not found"); // ✅ เปลี่ยนข้อความเป็นภาษาอังกฤษ
      return;
    }
  
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel" },
        { 
          text: "Delete Account", 
          onPress: async () => {
            try {
              const response = await axios.delete('https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/delete_account', {
                data: { user_id: userId },
              });
              if (response.status === 200) {
                Alert.alert('Success', 'Your account has been deleted'); // ✅ เปลี่ยนข้อความเป็นภาษาอังกฤษ
                navigation.navigate("Login"); // กลับไปที่หน้าล็อกอินหลังลบบัญชี
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete account'); // ✅ เปลี่ยนข้อความเป็นภาษาอังกฤษ
            }
          }
        },
      ]
    );
  };

  // ฟังก์ชันสำหรับปิดคีย์บอร์ดเมื่อผู้ใช้แตะที่พื้นหลัง
  const handleOutsidePress = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <ImageBackground 
        source={require("../assets/images/background profile.png")} 
        style={styles.background}
      >
        {/* พื้นหลังรูปภาพ */}
        <Image 
          source={require("../assets/images/ground profile.png")} 
          style={styles.profileBackground} 
        />

        {/* ส่วนหัวข้อ "My Profile" */}
        <View style={styles.myProfileContainer}>
          <Text style={styles.myProfileText}>My Profile</Text>
        </View>

        {/* ปุ่มกลับไปหน้า Overview */}
        <TouchableOpacity 
          style={styles.topRightButton} 
          onPress={() => navigation.navigate("Overview")}
        >
          <Image 
            source={require("../assets/images/home.png")} 
            style={styles.topRightIcon} 
          />
        </TouchableOpacity>

        {/* ส่วนแสดงข้อมูลโปรไฟล์ */}
        <View style={styles.profileContainer}>
          {/* รูปภาพโปรไฟล์ */}
          <Image 
            source={require("../assets/images/profile11.png")} 
            style={styles.profileImage} 
          />

          {/* ชื่อผู้ใช้และปุ่มแก้ไข */}
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

          {/* อีเมลผู้ใช้ */}
          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        {/* ปุ่ม Log Out */}
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

// สไตล์สำหรับ component
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