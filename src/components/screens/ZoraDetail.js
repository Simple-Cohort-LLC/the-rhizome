import React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { HEADER_HEIGHT } from "../organisms/Header";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const ZoraDetail = ({ route }) => {
  const { cast } = route.params;
  const navigation = useNavigation();

  const { name, description, network, tokenId, contract, embeds } = cast;

  const url = `https://zora.co/collect/${network}:${contract}/${tokenId}`;

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;

      if (translationX > 100 && velocityX > 500) {
        navigation.goBack();
      }
    }
  };

  return (
    <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <ScrollView>
          <Image source={{ uri: embeds[0].url }} style={styles.castImage} />

          <Text style={styles.displayName}>{name}</Text>
          <Text style={styles.channel}>{description}</Text>

          <TouchableOpacity onPress={() => Linking.openURL(url)}>
            <Text style={styles.zoraLink}>View on Zora</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212",
    paddingTop: HEADER_HEIGHT + 48,
  },
  backButton: {
    position: "absolute",
    top: HEADER_HEIGHT + 16,
    left: 20,
    backgroundColor: "#1E1E1E",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    zIndex: 999,
  },
  displayName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  castImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "contain",
    borderRadius: 10,
    marginBottom: 16,
  },
  channel: {
    fontSize: 14,
    color: "#BBBBBB",
    marginTop: 2,
  },
  zoraLink: {
    fontSize: 14,
    color: "#fff",
    marginTop: 16,
  },
});

export default ZoraDetail;
