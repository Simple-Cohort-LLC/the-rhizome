import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ChannelSelector = ({ channelMemberships, onSelect, selectedChannel }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChannels = channelMemberships.filter((channel) =>
    channel.channel_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChannel = ({ item }) => (
    <TouchableOpacity
      style={styles.channelItem}
      onPress={() => {
        onSelect(item);
        setSearchQuery("");
      }}
    >
      <Image source={{ uri: item.image }} style={styles.channelImage} />
      <Text style={styles.channelName}>{item.channel_id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {selectedChannel && (
        <View style={styles.selectedChannelContainer}>
          <Image
            source={{ uri: selectedChannel.image }}
            style={styles.channelImage}
          />
          <Text style={styles.channelName}>{selectedChannel.channel_id}</Text>
          <TouchableOpacity onPress={() => onSelect(null)}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search channels..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {searchQuery.length > 0 && (
        <FlatList
          data={filteredChannels}
          renderItem={renderChannel}
          keyExtractor={(item) => item.channel_id}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  list: {
    maxHeight: 200,
  },
  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: "#1E1E1E",
  },
  selectedChannel: {
    backgroundColor: "#2C2C2C",
  },
  channelImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  channelName: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
  },
  selectedChannelContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default ChannelSelector;
