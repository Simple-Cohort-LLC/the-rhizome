import React, { useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Replies = ({ replies, close }) => {
  const renderReplyItem = ({ item }) => {
    const {
      author: { display_name, pfp_url, username },
      reactions: { likes_count, recasts_count },
      embeds,
      text,
    } = item;

    return (
      <View style={styles.replyContainer}>
        <View style={styles.authorContainer}>
          <Image source={{ uri: pfp_url }} style={styles.pfp} />
          <View style={styles.authorDetails}>
            <Text style={styles.displayName}>{display_name}</Text>
            <Text style={styles.username}>@{username}</Text>
          </View>
        </View>

        <Text style={styles.text}>{text}</Text>

        {embeds.length > 0 && (
          <Image source={{ uri: embeds[0].url }} style={styles.replyImage} />
        )}

        <View style={styles.reactionsContainer}>
          {likes_count > 0 && (
            <Text style={styles.reactionText}>{likes_count} likes</Text>
          )}
          {recasts_count > 0 && (
            <Text style={styles.reactionText}>{recasts_count} recasts</Text>
          )}
        </View>
      </View>
    );
  };

  const keyExtractor = useCallback(
    (item, index) => `${item.hash}-${index}`,
    []
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={close}>
        <Ionicons name="close" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <FlatList
          data={replies}
          renderItem={renderReplyItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.flatListContainer}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContainer: {
    marginVertical: 8,
    padding: 16,
    backgroundColor: "#121212",
  },
  flatListContainer: {
    paddingBottom: 16,
    paddingTop: 40,
  },
  replyContainer: {
    padding: 16,
    backgroundColor: "#1E1E1E",
    marginBottom: 12,
    borderRadius: 10,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pfp: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorDetails: {
    marginLeft: 10,
  },
  displayName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  username: {
    fontSize: 12,
    color: "#BBBBBB",
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
    color: "#FFFFFF",
  },
  replyImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 8,
  },
  reactionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  reactionText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
    color: "#BBBBBB",
  },
});

export default Replies;
