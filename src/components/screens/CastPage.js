import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Button,
  ScrollView,
  Image,
  Alert,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchUserChannelMemberships, submitCast } from "../../api/Backend";
import { useApp } from "../../context/AppContext";
import * as ImagePicker from "expo-image-picker";
import ChannelSelector from "../organisms/ChannelSelector";

const CastPage = () => {
  const navigation = useNavigation();
  const { signerUuid, fid, isAuthenticated } = useApp();
  const insets = useSafeAreaInsets();

  const [inputText, setInputText] = useState("");
  const [imageUris, setImageUris] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [channelMemberships, setChannelMemberships] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    if (fid && channelMemberships.length === 0) {
      fetchUserChannelMemberships(fid).then((memberships) => {
        setChannelMemberships(memberships);
      });
    }
  }, [channelMemberships, fid]);

  const handleSubmit = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "You must have a Farcaster account and be logged in to write to the network."
      );
      return;
    }

    setSubmitting(true);

    submitCast(inputText, signerUuid, imageUris, selectedChannel?.channel_id)
      .then((res) => {
        if (res.error) {
          Alert.alert("Error submitting cast");
        } else {
          setImageUris([]);
          setInputText("");
          Alert.alert("Cast submitted");
        }
      })
      .catch((error) => {
        Alert.alert("Failed to submit cast", error.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleMediaButtonPress = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 2,
      base64: true,
    });

    if (!result.canceled) {
      setImageUris((prevUris) => [...prevUris, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    setImageUris((prevUris) => prevUris.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top - 40 }]}>
      <View style={styles.header}>
        <Text style={styles.modalTitle}>Cast</Text>
        <TouchableOpacity
          style={styles.closeButton}
          hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="What's happening?"
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={5}
            autoFocus
          />

          <ChannelSelector
            channelMemberships={channelMemberships}
            onSelect={setSelectedChannel}
            selectedChannel={selectedChannel}
          />

          {imageUris.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {imageUris.map((image, index) => (
                <View key={image.uri} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={handleMediaButtonPress}
            >
              <Ionicons name="image-outline" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <Button
                title="Cast"
                onPress={handleSubmit}
                disabled={(!inputText && imageUris.length === 0) || submitting}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  textInput: {
    width: "100%",
    height: 150,
    borderColor: "#333",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    textAlignVertical: "top",
    marginBottom: 20,
    fontSize: 16,
    color: "#FFFFFF",
    backgroundColor: "#1E1E1E",
  },
  buttonContainer: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  mediaButton: {
    backgroundColor: "#1E1E1E",
    padding: 10,
    borderRadius: 8,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  imageWrapper: {
    width: "48%",
    aspectRatio: 1,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1E1E1E",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  scrollContainer: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 5,
  },
});

export default CastPage;
