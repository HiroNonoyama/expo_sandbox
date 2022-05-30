import "expo-dev-client";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, Button, Platform, Text, View } from "react-native";

async function registerForPushNotificationsAsync() {
  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log(token);

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  return token;
}

export default function App2() {
  const [expoPushToken, setExpoPushToken] = useState("");
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });
  }, []);

  const handlePress = () => {
    Alert.alert("set notification");
    Notifications.scheduleNotificationAsync({
      content: {
        title: "title",
        body: "body",
        data: {},
      },
      trigger: { seconds: 1, channelId: "reminder" },
    });
  };
  const [isInitial, setIsInitial] = useState(true);
  useEffect(() => {
    setTimeout(() => setIsInitial(false), 1000);
  }, []);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {isInitial && <Text>Initial</Text>}
      <Text>{expoPushToken}</Text>
      <Button title="set reminder" onPress={handlePress} />
    </View>
  );
}
