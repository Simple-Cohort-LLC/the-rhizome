import "fast-text-encoding";
import "react-native-get-random-values";

import "./tailwind.css";

import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Feed from "./src/components/screens/Feed";
import Explore from "./src/components/screens/Explore";
import CastDetail from "./src/components/screens/CastDetail";
import { AppProvider } from "./src/context/AppContext";
import Header from "./src/components/organisms/Header";
import { Ionicons } from "@expo/vector-icons";
import Profile from "./src/components/screens/Profile";
import { Image, TouchableOpacity } from "react-native";
import { useApp } from "./src/context/AppContext";
import { useNavigation } from "@react-navigation/native";
import ZoraDetail from "./src/components/screens/ZoraDetail";
import CastPage from "./src/components/screens/CastPage";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { isAuthenticated, pfp } = useApp();
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopColor: "#333",
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#888888",
      }}
    >
      <Tab.Screen
        name="Feed"
        component={Feed}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) =>
            isAuthenticated ? (
              <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                <Image
                  source={{ uri: pfp }}
                  style={{ width: size, height: size, borderRadius: size / 2 }}
                />
              </TouchableOpacity>
            ) : (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
        }}
      />
    </Tab.Navigator>
  );
}

const App = () => {
  return (
    <AppProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="Home"
                component={TabNavigator}
                options={{
                  header: () => <Header />,
                }}
              />
              <Stack.Screen
                name="CastDetail"
                component={CastDetail}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="CastPage"
                component={CastPage}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="ZoraDetail"
                component={ZoraDetail}
                options={{
                  header: () => <Header />,
                }}
              />
              <Stack.Screen
                name="Profile"
                component={Profile}
                options={{
                  header: () => <Header />,
                }}
              />
            </Stack.Navigator>
            <StatusBar style="light" />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppProvider>
  );
};

export default App;
