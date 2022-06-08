import "expo-dev-client";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, Button, Platform, Text, View } from "react-native";
import AppleHealthKit, {
  BloodPressureSampleValue,
  HealthKitPermissions,
  HealthValue,
} from "react-native-health";

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

export default function App() {
  useEffect(() => {
    if (__DEV__) return;
    registerForPushNotificationsAsync().then((token) => {
      if (token) Alert.alert(token);
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
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        };
      },
    });
  };

  const [steps, setSteps] = useState<HealthValue[]>([]);
  const [weights, setWeights] = useState<HealthValue[]>([]);
  const [bps, setBps] = useState<BloodPressureSampleValue[]>([]);
  const connectHealthkit = () => {
    const option: HealthKitPermissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.BloodPressureDiastolic,
          AppleHealthKit.Constants.Permissions.BloodPressureSystolic,
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.Weight,
        ],
        write: [],
      },
    };
    AppleHealthKit.initHealthKit(option, (error) => {
      if (error) {
        Alert.alert(error);
      }

      const options = {
        startDate: new Date(2000, 1, 1).toISOString(),
      };

      AppleHealthKit.getDailyStepCountSamples(
        options,
        (callbackError: string, results: HealthValue[]) => {
          if (callbackError) {
            Alert.alert(callbackError);
          } else {
            console.log(results);
            setSteps(results);
          }
        }
      );
      AppleHealthKit.getWeightSamples(
        options,
        (callbackError: string, results: HealthValue[]) => {
          if (callbackError) {
            Alert.alert(callbackError);
          } else {
            console.log(results);
            setWeights(results);
          }
        }
      );
      AppleHealthKit.getBloodPressureSamples(
        options,
        (callbackError: string, results: BloodPressureSampleValue[]) => {
          if (callbackError) {
            Alert.alert(callbackError);
          } else {
            console.log(results);
            setBps(results);
          }
        }
      );
    });
  };
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button title="set reminder" onPress={handlePress} />
      <Button title="Connect Healthkit" onPress={connectHealthkit} />
      <Text>steps: {JSON.stringify(steps)}</Text>
      <Text>weights: {JSON.stringify(weights)}</Text>
      <Text>bps: {JSON.stringify(bps)}</Text>
    </View>
  );
}
