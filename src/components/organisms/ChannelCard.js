import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";

const PLACEHOLDER_COLOR = "#2A2A2A";
const BORDER_RADIUS = 10;

const PlaceholderImage = ({ style }) => (
  <View style={[style, styles.placeholderImage]} />
);

const ChannelCard = React.memo(({ channel }) => {
  const navigation = useNavigation();

  const handleChannelPress = () => {
    navigation.navigate("Feed", {
      channel: channel.name,
      channelDescription: channel.description,
      channelImage: channel.image_url,
      channelFollowers: channel.followers,
    });
  };

  const renderImage = (imageUrl, style) => {
    if (!imageUrl) return <PlaceholderImage style={style} />;
    return <Image source={{ uri: imageUrl }} style={style} />;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleChannelPress}>
      <View style={styles.imageContainer}>
        {renderImage(channel.thumbnail, styles.mainImage)}
        <View style={styles.smallImagesContainer}>
          {renderImage(channel.image_url, styles.smallImage)}
          {renderImage(channel.thumbnail, styles.smallImage)}
        </View>
      </View>
      <View style={styles.infoContainer}>
        {renderImage(channel.image_url, styles.avatar)}
        <View style={styles.textContainer}>
          <Text style={styles.channelName}>{channel.name}</Text>
          <Text style={styles.followers}>{channel.followers} followers</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

ChannelCard.propTypes = {
  channel: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    image_url: PropTypes.string,
    thumbnail: PropTypes.string,
    followers: PropTypes.number,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    marginHorizontal: 6,
    backgroundColor: "#1E1E1E",
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
  },
  imageContainer: {
    height: 200,
  },
  mainImage: {
    width: "100%",
    height: 133,
  },
  smallImagesContainer: {
    flexDirection: "row",
    height: 67,
  },
  smallImage: {
    width: "50%",
    height: "100%",
  },
  infoContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  followers: {
    fontSize: 14,
    color: "#AAAAAA",
  },
  placeholderImage: {
    backgroundColor: PLACEHOLDER_COLOR,
  },
});

export default ChannelCard;
