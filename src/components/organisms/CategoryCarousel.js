import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import ChannelCard from "./ChannelCard";

const CategoryCarousel = ({ category, channels }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <FlatList
        horizontal
        data={channels}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => <ChannelCard channel={item} />}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 12,
    marginBottom: 10,
  },
});

export default CategoryCarousel;
