import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView, // ใช้ ScrollView แทน KeyboardAwareScrollView
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker"; //ใช้สำหรับสร้าง Dropdown Menu แบบตรง select storage
import { Ionicons } from "@expo/vector-icons";//ไอคอนที่ใช้ในแอป
import { LinearGradient } from "expo-linear-gradient";//สร้างพื้นหลังแบบไล่สี
import axios from "axios";//ใช้ส่ง HTTP Request
import * as ImagePicker from "expo-image-picker";//ใช้เลือกรูปภาพจากอุปกรณ์
import FormData from "form-data";
import AsyncStorage from "@react-native-async-storage/async-storage";// ใช้เก็บข้อมูลในอุปกรณ์
import DateTimePicker from "@react-native-community/datetimepicker";//ใช้สำหรับเลือกวันที่
import { getUserID } from "../utils/storage";//ฟังก์ชันสำหรับดึง ID ผู้ใช้จาก AsyncStorage

const AddProductScreen = ({ navigation }) => {
  // State สำหรับเก็บข้อมูลต่าง ๆ
  const [selectedStorage, setSelectedStorage] = useState(null); // เก็บสถานที่เก็บสินค้า (Fridge, Freezer, Dry Food)
  const [storageDate, setStorageDate] = useState(new Date()); // เก็บวันที่เก็บสินค้า
  const [expirationDate, setExpirationDate] = useState(new Date()); // เก็บวันหมดอายุ
  const [note, setNote] = useState(""); // เก็บโน๊ตเพิ่มเติม
  const [imageUri, setImageUri] = useState(null); // เก็บ URI ของรูปภาพ
  const [userName, setUserName] = useState(""); // เก็บชื่อสินค้า
  const [open, setOpen] = useState(false); // ควบคุมการเปิด/ปิด Dropdown
  const [quantity, setQuantity] = useState(""); // เก็บจำนวนสินค้า
  const [userId, setUserId] = useState(null); // เก็บ ID ของผู้ใช้
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // ตรวจสอบว่าแป้นพิมพ์แสดงอยู่หรือไม่

  // ฟังก์ชันสำหรับจัดการการแสดง/ซ่อนแป้นพิมพ์
  const handleKeyboardShow = () => setIsKeyboardVisible(true);
  const handleKeyboardHide = () => setIsKeyboardVisible(false);

  // useEffect สำหรับติดตามการแสดง/ซ่อนแป้นพิมพ์
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", handleKeyboardShow);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", handleKeyboardHide);
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // useEffect สำหรับดึง ID ผู้ใช้จาก AsyncStorage
  useEffect(() => {
    const checkUserID = async () => {
      try {
        const storedUserId = await getUserID();
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          Alert.alert("User not logged in", "Please log in to continue");
        }
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };
    checkUserID();
  }, []);

  // ฟังก์ชันสำหรับเลือกรูปภาพจากไลบรารี
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    } else {
      Alert.alert("กรุณาเลือกภาพ");
    }
  };

  // ฟังก์ชันสำหรับอัปโหลดรูปภาพไปยังเซิร์ฟเวอร์
  const uploadImage = async (uri) => {
    let formData = new FormData();
    let filename = uri.split("/").pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    formData.append("file", { uri, name: filename, type });

    try {
      let response = await axios.post(
        "https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.file_url) {
        setImageUri(response.data.file_url);
      } else {
        console.log("No file_url received from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงวันที่เก็บสินค้า
  const onChangeStorageDate = (event, selectedDate) => {
    const currentDate = selectedDate || storageDate;
    setStorageDate(currentDate);
  };

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงวันหมดอายุ
  const onChangeExpirationDate = (event, selectedDate) => {
    const currentDate = selectedDate || expirationDate;
    setExpirationDate(currentDate);
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูลสินค้า
  const saveProduct = async () => {
    if (!userId) {
      Alert.alert("ไม่พบข้อมูลผู้ใช้", "กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล");
      return;
    }

    if (!selectedStorage || !userName || !quantity || !imageUri) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบถ้วน", "ข้อมูลบางส่วนยังไม่ถูกกรอก");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert("กรุณาใส่จำนวนสินค้าให้ถูกต้อง", "จำนวนสินค้าต้องเป็นตัวเลขและมากกว่า 0");
      return;
    }

    //สร้างข้อมูลสินค้า  จัดรูปแบบข้อมูลให้พร้อมส่งไปยังเซิร์ฟเวอร์
    const productData = {
      name: userName,
      storage: selectedStorage,
      storage_date: storageDate.toISOString().split("T")[0],
      expiration_date: expirationDate.toISOString().split("T")[0],
      quantity: parseInt(quantity),
      note: note,
      user_id: parseInt(userId),
      photo: imageUri,
    };

    //ส่งข้อมูลไปยังเซิร์ฟเวอร์
    try {
      const response = await axios.post(
        "https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/add_item",//: ส่ง HTTP POST Request ไปยัง URL ของเซิร์ฟเวอร์
        productData,
        { headers: { "Content-Type": "application/json" } }//กำหนด Header ของ Request เป็น application/json เพื่อบอกเซิร์ฟเวอร์ว่าข้อมูลที่ส่งไปเป็น JSON
      );

      // ตรวจสอบผลลัพธ์จากเซิร์ฟเวอร์
      if (response.status === 201) {
        Alert.alert("สำเร็จ", "สินค้าถูกเพิ่มเรียบร้อยแล้ว", [
          { text: "ตกลง", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    //จัดการข้อผิดพลาด
    } catch (error) { //จับข้อผิดพลาดที่เกิดขึ้นระหว่างการส่ง Request
      console.error("Error saving product:", error);//แสดงข้อผิดพลาดใน Console เพื่อ Debug
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    }
  };

   // State สำหรับควบคุมการแสดง Date Picker
   const [showStorageDatePicker, setShowStorageDatePicker] = useState(false);
   const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);
 
   // ฟังก์ชันสำหรับแสดง Date Picker
   const showDatepicker = (type) => {
     if (type === "storage") {
       setShowExpirationDatePicker(false);
       setShowStorageDatePicker(true);
     } else if (type === "expiration") {
       setShowStorageDatePicker(false);
       setShowExpirationDatePicker(true);
     }
   };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
    {/* KeyboardAvoidingView: ช่วยเลื่อนหน้าจอเมื่อแป้นพิมพ์แสดงขึ้น */}
    {/* behavior: กำหนดพฤติกรรมการเลื่อนหน้าจอ (iOS ใช้ "padding", Android ใช้ "height") */}
    {/* keyboardVerticalOffset: กำหนดระยะห่างจากแป้นพิมพ์ (เฉพาะ iOS) */}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
      {/* ScrollView: ทำให้หน้าจอเลื่อนได้เมื่อมีเนื้อหามาก */}
      {/* keyboardShouldPersistTaps="handled": ป้องกันแป้นพิมพ์ปิดเมื่อกดพื้นที่อื่น */}

        <View style={styles.container}>
          {/* View: เป็น Container หลักของหน้าจอ */}
          <LinearGradient colors={["#B3D4FF", "#FFFFFF"]} style={styles.gradientBackground} />
          {/* LinearGradient: สร้างพื้นหลังแบบไล่สี */}

          <View style={styles.header}>
            {/* View: Container สำหรับส่วนหัวของหน้าจอ */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
              {/* TouchableOpacity: ปุ่มสำหรับย้อนกลับ */}
              <Text style={styles.cancelText}>Cancel</Text>
              {/* Text: แสดงข้อความ "Cancel" */}
            </TouchableOpacity>
            <Text style={styles.title}>New Product</Text>
            {/* Text: แสดงข้อความ "New Product" */}
            <TouchableOpacity onPress={saveProduct}>
            {/* TouchableOpacity: ปุ่มสำหรับบันทึกข้อมูล */}
            <Text style={styles.saveText}>Save</Text>
            {/* Text: แสดงข้อความ "Save" */}
          </TouchableOpacity>
        </View>

          <TouchableOpacity onPress={pickImage}>
            {/* TouchableOpacity: ปุ่มสำหรับเลือกรูปภาพ */}
            <View style={styles.imagePlaceholder}>
              {/* View: Container สำหรับแสดงรูปภาพหรือข้อความ "Tap to add image" */}
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
              )}
                {/* Image: แสดงรูปภาพที่ผู้ใช้เลือก */}
                {/* Text: แสดงข้อความ "Tap to add image" ถ้ายังไม่มีรูปภาพ */}

            </View>
          </TouchableOpacity>

          <View style={[styles.formContainer, isKeyboardVisible && styles.formContainerShifted]}>
          {/* View: Container สำหรับฟอร์มกรอกข้อมูล */}
          {/* isKeyboardVisible && styles.formContainerShifted: เลื่อนฟอร์มขึ้นเมื่อแป้นพิมพ์แสดงขึ้น */}

          <Text style={styles.label}>Name</Text>
          {/* Text: แสดงข้อความ "Name" */}
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            value={userName}
            onChangeText={(text) => setUserName(text)}
            placeholderTextColor="#B0B0B0"
          />
          {/* TextInput: ช่องกรอกชื่อสินค้า */}

          <Text style={styles.label}>Storage</Text>
          {/* Text: แสดงข้อความ "Storage" */}
          <DropDownPicker
            open={open}
            setOpen={setOpen}
            value={selectedStorage}
            setValue={setSelectedStorage}
            items={[
              { label: "Fridge", value: "fridge" },
              { label: "Freezer", value: "freezer" },
              { label: "Dry Food", value: "dry_food" },
            ]}
            placeholder="Select Storage"
            style={styles.picker}
            dropDownContainerStyle={styles.dropDownStyle}
          />
          {/* DropDownPicker: Dropdown สำหรับเลือกสถานที่เก็บสินค้า */}

          <Text style={styles.label}>Storage Date</Text>
          {/* Text: แสดงข้อความ "Storage Date" */}
          <TouchableOpacity style={styles.dateInput} onPress={() => showDatepicker("storage")}>
            {/* TouchableOpacity: ปุ่มสำหรับเลือกวันที่เก็บสินค้า */}
            <Text style={{ flex: 1 }}>{storageDate.toLocaleDateString()}</Text>
            {/* Text: แสดงวันที่เก็บสินค้า */}
            <Ionicons name="calendar-outline" size={20} color="gray" />
            {/* Ionicons: ไอคอนรูปปฏิทิน */}
          </TouchableOpacity>

          <Text style={styles.label}>Expiration Date</Text>
          {/* Text: แสดงข้อความ "Expiration Date" */}
          <TouchableOpacity style={styles.dateInput} onPress={() => showDatepicker("expiration")}>
            {/* TouchableOpacity: ปุ่มสำหรับเลือกวันหมดอายุ */}
            <Text style={{ flex: 1 }}>{expirationDate.toLocaleDateString()}</Text>
            {/* Text: แสดงวันหมดอายุ */}
            <Ionicons name="calendar-outline" size={20} color="gray" />
            {/* Ionicons: ไอคอนรูปปฏิทิน */}
          </TouchableOpacity>

          <Text style={styles.label}>Quantity</Text>
          {/* Text: แสดงข้อความ "Quantity" */}
          <TextInput
            style={styles.input}
            placeholder="Enter quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholderTextColor="#B0B0B0"
          />
          {/* TextInput: ช่องกรอกจำนวนสินค้า */}

          <Text style={styles.label}>Note</Text>
          {/* Text: แสดงข้อความ "Note" */}
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Notes"
            multiline
            value={note}
            onChangeText={setNote}
            placeholderTextColor="#B0B0B0"
          />
          {/* TextInput: ช่องกรอกโน๊ตเพิ่มเติม (หลายบรรทัด) */}
        </View>
      </View>
    </ScrollView>

    {showStorageDatePicker && (
      <View style={styles.dateTimePickerStorageContainer}>
        {/* View: Container สำหรับ Date Picker ของวันที่เก็บสินค้า */}
        <DateTimePicker
          value={storageDate}
          mode="date"
          display="spinner"
          textColor="black"
          onChange={onChangeStorageDate}
          style={styles.dateTimePicker}
        />
        {/* DateTimePicker: ตัวเลือกวันที่เก็บสินค้า */}
        <TouchableOpacity style={styles.confirmButton} onPress={() => setShowStorageDatePicker(false)}>
          {/* TouchableOpacity: ปุ่มสำหรับยืนยันวันที่ */}
          <Text style={styles.confirmText}>Confirm Date</Text>
          {/* Text: แสดงข้อความ "Confirm Date" */}
        </TouchableOpacity>
      </View>
    )}

    {showExpirationDatePicker && (
      <View style={styles.dateTimePickerExpirationContainer}>
        {/* View: Container สำหรับ Date Picker ของวันหมดอายุ */}
        <DateTimePicker
          value={expirationDate}
          mode="date"
          display="spinner"
          textColor="black"
          onChange={onChangeExpirationDate}
          style={[styles.dateTimePicker, { height: 150 }]}
        />
        {/* DateTimePicker: ตัวเลือกวันหมดอายุ */}
        <TouchableOpacity style={styles.confirmButton} onPress={() => setShowExpirationDatePicker(false)}>
          {/* TouchableOpacity: ปุ่มสำหรับยืนยันวันที่ */}
          <Text style={styles.confirmText}>Confirm Date</Text>
          {/* Text: แสดงข้อความ "Confirm Date" */}
        </TouchableOpacity>
      </View>
    )}
  </KeyboardAvoidingView>
 );
};

const styles = StyleSheet.create({
  //Container หลักของหน้าจอ
  container: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  //พื้นหลังแบบไล่สี
  gradientBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  //ส่วนหัวของหน้าจอ (มีปุ่ม Cancel, Title, และ Save)
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  cancelText: { fontSize: 16, color: "red", fontWeight: "bold" },//สไตล์ข้อความปุ่ม Cancel
  saveText: { fontSize: 16, color: "blue", fontWeight: "bold" },//สไตล์ข้อความปุ่ม Save
  title: { fontSize: 20, fontWeight: "bold", color: "#2D3B6B" },//สไตล์ข้อความ Title
  //สไตล์พื้นที่สำหรับเลือกรูปภาพ
  imagePlaceholder: {
    height: 120,
    width: 120,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: { color: "#ccc", textAlign: "center" },//สไตล์ข้อความ "Tap to add image"
  //สไตล์ Container ของฟอร์มกรอกข้อมูล
  formContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 20,
    marginTop: 25,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  //สไตล์สำหรับเลื่อนฟอร์มขึ้นเมื่อแป้นพิมพ์แสดงขึ้น
  formContainerShifted: {
    marginBottom: Platform.OS === "ios" ? 300 : 250,
  },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 5, color: "black" },//สไตล์ข้อความ Label(ข้อความที่บอกว่าช่องนั้นกรอกไร) ของฟอร์ม
  //สไตล์ช่องกรอกข้อมูล
  input: {
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 10,
    marginBottom: 15,
    color: "black",
  },
  //สไตล์ Dropdown Picker(เมนูแบบเลื่อนลง)
  picker: {
    height: 40,
    width: "100%",
    justifyContent: "center",
    marginBottom: 20,
  },
  //สไตล์ของ Dropdown Menu
  dropDownStyle: {
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
  },
  //สไตล์ช่องเลือกวันที่
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  noteInput: { height: 80, textAlignVertical: "top" }, //สไตล์ช่องกรอกโน๊ต
  //สไตล์ Date Picker
  dateTimePicker: {
    height: 100,
  },
  //สไตล์ Container ของ Date Picker สำหรับวันที่เก็บสินค้า
  dateTimePickerStorageContainer: {
    position: "absolute",
    top: "60%",
    left: "5%",
    backgroundColor: "white",
    borderRadius: 20,
    zIndex: 10,
    padding: 10,
  },
  // สไตล์ Container ของ Date Picker สำหรับวันหมดอายุ
  dateTimePickerExpirationContainer: {
    position: "absolute",
    top: "60%",
    left: "5%",
    backgroundColor: "white",
    borderRadius: 20,
    zIndex: 10,
    padding: 10,
  },
  //สไตล์ปุ่มยืนยันวันที่
  confirmButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderRadius: 10,
  },
  //สไตล์ข้อความปุ่มยืนยัน
  confirmText: {
    color: "white",
    fontSize: 16,
  },
  //สไตล์รูปภาพที่แสดงในพื้นที่เลือกรูปภาพ
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
});

export default AddProductScreen;