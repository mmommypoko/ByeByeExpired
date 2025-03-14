import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Image , 
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import FormData from "form-data";  // ใช้ FormData ส่งไฟล์ไปเซิร์ฟเวอร์

import DateTimePicker from "@react-native-community/datetimepicker";

const AddProductScreen = ({ navigation }) => {
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [storageDate, setStorageDate] = useState(new Date());
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [userName, setUserName] = useState("");
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);  // แสดงตัวอย่างรูปที่เลือก
      uploadImage(result.assets[0].uri);  // อัปโหลดรูป
    }
  };

  const uploadImage = async (uri) => {
    let formData = new FormData();
    let filename = uri.split("/").pop();  // ดึงชื่อไฟล์
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;
  
    formData.append("file", {
      uri,
      name: filename,
      type,
    });
  
    try {
      let response = await axios.post("https://sturdy-space-goggles-pj7p6j47w79q294p9-5001.app.github.dev/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data.file_url) {
        setImageUri(response.data.file_url); // ตั้งค่าลิงก์รูปที่อัปโหลดแล้ว
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };
  
  const onChangeStorageDate = (event, selectedDate) => {
    const currentDate = selectedDate || storageDate;
    setStorageDate(currentDate);
  };

  const onChangeExpirationDate = (event, selectedDate) => {
    const currentDate = selectedDate || expirationDate;
    setExpirationDate(currentDate);
  };

  const saveProduct = () => {
    if (!selectedStorage || !userName || !note || !quantity) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
  
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert("กรุณาใส่จำนวนสินค้าให้ถูกต้อง");
      return;
    }
  
    Alert.alert("ข้อมูลผลิตภัณฑ์ถูกบันทึกแล้ว", "", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };
  

  const [showStorageDatePicker, setShowStorageDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);

  const showDatepicker = (type) => {
    if (type === "storage") {
      setShowExpirationDatePicker(false); // ปิด Expiration Date Picker หากเปิดอยู่
      setShowStorageDatePicker(true);     // เปิด Storage Date Picker
    } else if (type === "expiration") {
      setShowStorageDatePicker(false);    // ปิด Storage Date Picker หากเปิดอยู่
      setShowExpirationDatePicker(true);  // เปิด Expiration Date Picker
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Gradient Background */}
        <LinearGradient
          colors={["#B3D4FF", "#FFFFFF"]}
          style={styles.gradientBackground}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Product</Text>
          <TouchableOpacity onPress={saveProduct}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Image Placeholder */}
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.imagePlaceholder}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
            )}
          </View>
        </TouchableOpacity>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            value={userName}
            onChangeText={text => setUserName(text)}
            placeholderTextColor="#B0B0B0"
          />

          <Text style={styles.label}>Storage</Text>
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

          <Text style={styles.label}>Storage Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => showDatepicker("storage")}
          >
            <Text style={{ flex: 1 }}>{storageDate.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={20} color="gray" />
          </TouchableOpacity>

          <Text style={styles.label}>Expiration Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => showDatepicker("expiration")}
          >
            <Text style={{ flex: 1 }}>{expirationDate.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={20} color="gray" />
          </TouchableOpacity>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholderTextColor="#B0B0B0"
          />

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Notes"
            multiline
            value={note}
            onChangeText={setNote}
            placeholderTextColor="#B0B0B0"
          />
        </View>

        {/* DateTimePicker สำหรับ Storage Date */}
        {showStorageDatePicker && (
          <View style={styles.dateTimePickerStorageContainer}>
            <DateTimePicker
              value={storageDate}
              mode="date"
              display="spinner"
              onChange={onChangeStorageDate}
              style={styles.dateTimePicker}
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowStorageDatePicker(false)}
            >
              <Text style={styles.confirmText}>Confirm Date</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DateTimePicker สำหรับ Expiration Date */}
        {showExpirationDatePicker && (
          <View style={styles.dateTimePickerExpirationContainer}>
            <DateTimePicker
              value={expirationDate}
              mode="date"
              display="spinner"
              onChange={onChangeExpirationDate}
              style={[styles.dateTimePicker, { height: 150 }]}
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowExpirationDatePicker(false)}
            >
              <Text style={styles.confirmText}>Confirm Date</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  gradientBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  cancelText: { fontSize: 16, color: "red" },
  saveText: { fontSize: 16, color: "blue" },
  title: { fontSize: 20, fontWeight: "bold", color: "#2D3B6B" },

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
  imagePlaceholderText: { color: "#ccc", textAlign: "center" },

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

  label: { fontSize: 14, fontWeight: "500", marginBottom: 5, color: "black" },
  input: {
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 10,
    marginBottom: 15,
    color: "black",
  },

  picker: {
    height: 40,
    width: "100%",
    justifyContent: "center",
    marginBottom: 20,
  },

  dropDownStyle: {
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
  },

  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 10,
    marginBottom: 20,
  },

  noteInput: { height: 80, textAlignVertical: "top" },

  dateTimePicker: {
    height: 100
  },

  dateTimePickerStorageContainer: {
    position: "absolute",
    top: "60%",
    left: "5%",
    backgroundColor: "white",
    borderRadius: 20,
    zIndex: 10,
    padding: 10,
  },

  dateTimePickerExpirationContainer: {
    position: "absolute",
    top: "60%",
    left: "5%",
    backgroundColor: "white",
    borderRadius: 20,
    zIndex: 10,
    padding: 10,
  },

  confirmButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderRadius: 10,
  },

  confirmText: {
    color: "white",
    fontSize: 16,
  },

  imagePreview: {
    width: "100%",  
    height: "100%",
    borderRadius: 10, 
    resizeMode: "cover",
  },
  
});

export default AddProductScreen;