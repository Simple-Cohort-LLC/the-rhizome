import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NeynarSigninButton } from "@neynar/react-native-signin";
import { useApp } from "../../context/AppContext";
import { fetchAuthorizationUrl } from "../../api/Backend";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export const HEADER_HEIGHT = 110;

const Header = () => {
  const { handleSignin, isAuthenticated, handleSignout } = useApp();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [scrollY] = useState(new Animated.Value(0));

  const handleError = (error) => {
    console.error(error);
  };

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: headerTranslate }],
          paddingTop: insets.top,
        },
      ]}
    >
      <TouchableOpacity onPress={() => navigation.navigate("Feed")}>
        <Image
          source={require("../../../assets/logo.png")}
          style={styles.logo}
        />
      </TouchableOpacity>
      <View style={styles.buttonsContainer}>
        {!isAuthenticated && (
          <NeynarSigninButton
            fetchAuthorizationUrl={fetchAuthorizationUrl}
            successCallback={handleSignin}
            errorCallback={handleError}
            redirectUrl={`rhizome://`}
            width={Platform.OS === "ios" ? 100 : 50}
            height={40}
            marginTop={20}
          />
        )}
        <TouchableOpacity onPress={() => navigation.navigate("CastPage")}>
          <Ionicons name="add-circle-outline" color="#FFFFFF" size={30} />
        </TouchableOpacity>
        {isAuthenticated && (
          <TouchableOpacity onPress={handleSignout} style={{ marginLeft: 10 }}>
            <Ionicons name="log-out" color="#FFFFFF" size={30} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = {
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#1E1E1E",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: HEADER_HEIGHT,
  },
  logo: {
    width: 70,
    height: 40,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
};

export default Header;
