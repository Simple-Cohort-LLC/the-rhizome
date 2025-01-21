import React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ZoraDetail = ({ route }) => {
  const { cast } = route.params;
  const navigation = useNavigation();

  const { name, description, network, tokenId, contract, embeds } = cast;

  const url = `https://zora.co/collect/${network}:${contract}/${tokenId}`;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Image source={{ uri: embeds[0].url }} style={styles.castImage} />

      <Text style={styles.displayName}>{name}</Text>
      <Text style={styles.channel}>{description}</Text>

      <TouchableOpacity onPress={() => Linking.openURL(url)}>
        <Text style={styles.zoraLink}>View on Zora</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212",
  },
  backButton: {
    position: "absolute",
    left: 20,
    bottom: 30,
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
    zIndex: 1999,
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
