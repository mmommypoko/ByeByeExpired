import AsyncStorage from '@react-native-async-storage/async-storage';

// ฟังก์ชันดึงข้อมูล user_id
export const getUserID = async () => {
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (userId !== null) {
      console.log("Retrieved user_id:", userId);
      return userId;
    } else {
      console.log("No user_id found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user_id:", error);
    return null;
  }
};

// ฟังก์ชันบันทึก user_id
export const setUserID = async (userId) => {
  try {
    // เปลี่ยนเป็น string ก่อนบันทึก
    if (userId && (typeof userId === 'string' || typeof userId === 'number')) {
      await AsyncStorage.setItem('user_id', userId.toString());
      console.log("User ID saved successfully:", userId);
    } else {
      console.error("Invalid user_id type");
    }
  } catch (error) {
    console.error("Error setting user ID:", error);
  }
};

// ฟังก์ชันลบ user_id (เผื่อใช้ตอน Logout)
export const removeUserID = async () => {
  try {
    await AsyncStorage.removeItem('user_id');
  } catch (error) {
    console.error("Error removing user ID:", error);
  }
};