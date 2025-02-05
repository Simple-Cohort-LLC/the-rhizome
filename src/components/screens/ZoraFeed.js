import {
  Dimensions,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MasonryList from "@react-native-seoul/masonry-list";
import { useApp } from "../../context/AppContext";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchZora } from "../../api/Backend";
import { useNavigation } from "@react-navigation/native";
import { HEADER_HEIGHT } from "../organisms/Header";

const ZoraFeed = () => {
  const { isDarkMode } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchZoraPosts = async () => {
    const data = await fetchZora();

    setPosts(data);

    setLoading(false);
  };

  useEffect(() => {
    if (loading || posts.length) return;
    setLoading(true);

    fetchZoraPosts();
  }, []);

  const RenderPost = React.memo(({ item }) => {
    const imageUrl = item.embeds[0]?.url;

    if (!imageUrl) return null;

    const width = useMemo(() => Dimensions.get("window").width / 2 - 8, []);

    const navigation = useNavigation();

    const aspectRatio =
      item.embeds[0]?.metadata?.image?.width_px /
        item.embeds[0]?.metadata?.image?.height_px || 1;

    const height = width / aspectRatio;

    return (
      <TouchableOpacity
        style={[styles.itemContainer, { width, height }]}
        onPress={() => {
          navigation.navigate("ZoraDetail", {
            cast: item,
          });
        }}
      >
        <View style={{ width, height }}>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>
    );
  });

  const getItemLayout = useCallback((data, index) => {
    const itemWidth = Dimensions.get("window").width / 2 - 8;
    const aspectRatio = data[index].embeds[0]?.image?.height_px
      ? data[index].embeds[0].image.width_px /
        data[index].embeds[0].image.height_px
      : 1;
    const itemHeight = itemWidth / aspectRatio;

    return {
      length: itemHeight,
      offset: itemHeight * Math.floor(index / 2),
      index,
    };
  }, []);

  const renderItem = useCallback(({ item }) => <RenderPost item={item} />, []);

  const keyExtractor = useCallback(
    (item, index) => `${item.thread_hash}-${index}`,
    []
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View
      className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`}
      style={{
        paddingTop: HEADER_HEIGHT,
      }}
    >
      <MasonryList
        data={posts}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.containerMasonry}
        numColumns={2}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  containerMasonry: {
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 2,
  },
  image: {
    width: "100%",
    height: Dimensions.get("window").width * 0.6,
  },
  textContainer: {
    padding: 10,
  },
  author: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: "#666",
  },
  demoBtn: {
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 5,
    marginTop: 10,
  },
  demoBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ZoraFeed;
