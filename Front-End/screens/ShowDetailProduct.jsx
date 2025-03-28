import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard, 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // ใช้สร้างพื้นหลังแบบไล่สี
import axios from "axios"; // ใช้สำหรับส่ง HTTP Request
import AsyncStorage from "@react-native-async-storage/async-storage"; // ใช้สำหรับเก็บข้อมูลในอุปกรณ์
import DropDownPicker from "react-native-dropdown-picker"; // ใช้สำหรับสร้าง Dropdown Menu
import DateTimePicker from "@react-native-community/datetimepicker"; // ใช้สำหรับเลือกวันที่
import { Ionicons } from "@expo/vector-icons"; // ใช้สำหรับไอคอน
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"; // ใช้สำหรับเลื่อนหน้าจอเมื่อแป้นพิมพ์แสดงขึ้น

const ShowDetailofProduct = ({ route, navigation }) => {
  // รับข้อมูลสินค้าจาก route.params
  const { product } = route.params;

  // State สำหรับตรวจสอบว่าอยู่ในโหมดแก้ไขหรือไม่
  const [isEditing, setIsEditing] = useState(false);

  // State สำหรับเก็บข้อมูลสินค้าที่แก้ไข
  const [editedProduct, setEditedProduct] = useState({ ...product });

  // State สำหรับควบคุมการแสดง Date Picker ของวันหมดอายุ
  const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);

  // State สำหรับเก็บวันที่หมดอายุชั่วคราว (ใช้กับ Date Picker)
  const [tempExpirationDate, setTempExpirationDate] = useState(
    new Date(editedProduct.expiration_date)
  );

  // ฟังก์ชันสำหรับบันทึกการแก้ไขข้อมูลสินค้า
  const handleSave = async () => {
    try {
      // ดึง user_id จาก AsyncStorage
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        Alert.alert("Error", "User ID not found");
        return;
      }

      // ตรวจสอบว่าข้อมูลถูกกรอกครบถ้วนหรือไม่
      if (
        !editedProduct.name ||
        !editedProduct.storage ||
        !editedProduct.storage_date ||
        !editedProduct.expiration_date
      ) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      // สร้างข้อมูลสินค้าที่แก้ไข
      const updatedProduct = {
        name: editedProduct.name,
        storage: editedProduct.storage,
        storage_date: new Date(editedProduct.storage_date).toISOString(),
        expiration_date: new Date(editedProduct.expiration_date).toISOString(),
        quantity: editedProduct.quantity,
        note: editedProduct.note,
        photo: editedProduct.photo,
        user_id: parseInt(editedProduct.user_id),
      };

      // ส่งข้อมูลไปยังเซิร์ฟเวอร์เพื่ออัปเดต
      const response = await axios.put(
        `https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/update_item/${editedProduct._id}`,
        updatedProduct
      );

      // ถ้าอัปเดตสำเร็จ
      if (response.status === 200) {
        // อัปเดต State และแสดงข้อความสำเร็จ
        setEditedProduct((prevProduct) => ({
          ...prevProduct,
          ...updatedProduct,
        }));
        Alert.alert("Success", "Product updated successfully");
        setIsEditing(false);

        // ถ้ามีฟังก์ชัน onUpdate ใน route.params ให้เรียกใช้
        if (route.params?.onUpdate) {
          route.params.onUpdate(editedProduct._id, updatedProduct);
        }

        // กลับไปยังหน้าจอก่อนหน้า
        navigation.goBack();
      }
    } catch (error) {
      // จัดการข้อผิดพลาด
      console.error("Error updating product:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
      Alert.alert("Error", "Failed to update product");
    }
  };

  // ฟังก์ชันสำหรับลบสินค้า
  const handleDelete = async () => {
    // แสดง Alert เพื่อยืนยันการลบ
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              // ดึง user_id จาก AsyncStorage
              const userId = await AsyncStorage.getItem("user_id");
              if (!userId) {
                Alert.alert("Error", "User ID not found");
                return;
              }

              // ส่ง Request ลบสินค้าไปยังเซิร์ฟเวอร์
              const response = await axios.delete(
                `https://fuzzy-space-giggle-pjw99rqj6ww5hgrg-5000.app.github.dev/delete_item/${editedProduct._id}`
              );

              // ถ้าลบสำเร็จ
              if (response.status === 200) {
                Alert.alert("Success", "Product deleted successfully");
                navigation.goBack();
              }
            } catch (error) {
              // จัดการข้อผิดพลาด
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete product");
            }
          },
        },
      ]
    );
  };

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงวันที่หมดอายุ
  const onChangeExpirationDate = (event, selectedDate) => {
    const currentDate = selectedDate || tempExpirationDate;
    setTempExpirationDate(currentDate);
  };

  // ฟังก์ชันสำหรับยืนยันวันที่หมดอายุ
  const confirmExpirationDate = () => {
    setEditedProduct({
      ...editedProduct,
      expiration_date: tempExpirationDate.toISOString(),
    });
    setShowExpirationDatePicker(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={["#a4d2ff", "#FFFFFF"]} style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Product Details</Text>

            {isEditing ? (
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 50 }} />
            )}
          </View>

          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={100}
            extraHeight={100}
          >
            <View style={styles.productContainer}>
              <Image
                source={{ uri: editedProduct.photo }}
                style={styles.productImage}
              />
              {isEditing ? (
                <>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProduct.name}
                    onChangeText={(text) =>
                      setEditedProduct({ ...editedProduct, name: text })
                    }
                    placeholder="Product Name"
                  />

                  <Text style={styles.label}>Storage</Text>
                  <Text style={styles.productText}>{editedProduct.storage}</Text>

                  <Text style={styles.label}>Storage Date</Text>
                  <Text style={styles.productText}>
                    {new Date(editedProduct.storage_date).toLocaleDateString()}
                  </Text>

                  <Text style={styles.label}>Expiration Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowExpirationDatePicker(true)}
                  >
                    <Text style={{ flex: 1 }}>
                      {new Date(editedProduct.expiration_date).toLocaleDateString()}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="gray" />
                  </TouchableOpacity>

                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProduct.quantity.toString()}
                    onChangeText={(text) =>
                      setEditedProduct({
                        ...editedProduct,
                        quantity: parseInt(text) || 0,
                      })
                    }
                    placeholder="Quantity"
                    keyboardType="numeric"
                  />

                  <Text style={styles.label}>Note</Text>
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    value={editedProduct.note}
                    onChangeText={(text) =>
                      setEditedProduct({ ...editedProduct, note: text })
                    }
                    placeholder="Note"
                    multiline
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Name</Text>
                  <Text style={styles.productText}>{editedProduct.name}</Text>

                  <Text style={styles.label}>Storage</Text>
                  <Text style={styles.productText}>{editedProduct.storage}</Text>

                  <Text style={styles.label}>Storage Date</Text>
                  <Text style={styles.productText}>
                    {new Date(editedProduct.storage_date).toLocaleDateString()}
                  </Text>

                  <Text style={styles.label}>Expiration Date</Text>
                  <Text style={styles.productText}>
                    {new Date(editedProduct.expiration_date).toLocaleDateString()}
                  </Text>

                  <Text style={styles.label}>Quantity</Text>
                  <Text style={styles.productText}>{editedProduct.quantity}</Text>

                  <Text style={styles.label}>Note</Text>
                  <Text style={styles.productText}>{editedProduct.note}</Text>
                </>
              )}
            </View>
          </KeyboardAwareScrollView>

          <View style={styles.buttonContainer}>
            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>

          {showExpirationDatePicker && (
            <View style={styles.dateTimePickerContainer}>
              <DateTimePicker
                value={tempExpirationDate}
                mode="date"
                display="spinner"
                onChange={onChangeExpirationDate}
                textColor="black"
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmExpirationDate}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: "#033495",
    fontWeight: "bold",
  },
  saveButtonText: {
    fontSize: 16,
    color: "blue",
    fontWeight: "bold",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#033495",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  productContainer: {
    alignItems: "flex-start",
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    borderRadius: 8,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#033495",
    marginTop: 10,
  },
  productText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 10,
    marginBottom: 20,
    color: "black",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  editButton: {
    backgroundColor: "#033495",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  dateTimePickerContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  confirmText: {
    color: "white",
    fontSize: 16,
  },
});

export default ShowDetailofProduct;