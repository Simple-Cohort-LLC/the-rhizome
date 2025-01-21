import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getRandomChannels } from "../../utils/channels";
import { sortByScore } from "../../utils/sort";
import {
  DEFAULT_PAGE_SIZE_FOR_CHANNEL,
  DEFAULT_PAGE_SIZE_INITIAL,
} from "../../consts/channels";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import _ from "lodash";
import { HEADER_HEIGHT } from "../organisms/Header";
import MasonryList from "@react-native-seoul/masonry-list";
import { fetchSomeChannelCasts } from "../../api/Backend";

const RenderCast = React.memo(({ item, channel, styles }) => {
  const imageUrl = item.embeds[0]?.url;
  const navigation = useNavigation();
  const itemWidth = useMemo(() => Dimensions.get("window").width / 2 - 8, []);
  const aspectRatio =
    item.embeds[0]?.metadata?.image?.width_px /
      item.embeds[0]?.metadata?.image?.height_px || 1;
  const itemHeight = itemWidth / aspectRatio;

  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        {
          width: itemWidth,
          height: itemHeight,
          margin: 4,
        },
      ]}
      onPress={() => {
        navigation.navigate(item.isZora ? "ZoraDetail" : "CastDetail", {
          cast: item.isZora
            ? item
            : {
                ...item,
                channel: channel || item.channel?.name || "Unknown Channel",
                channelImage: item.channel.image_url || null,
              },
        });
      }}
    >
      <View style={{ width: itemWidth, height: itemHeight }}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? "black" : "white",
      paddingHorizontal: 4,
      paddingBottom: 20,
    },
    itemContainer: {
      backgroundColor: isDarkMode ? "#1E1E1E" : "#F0F0F0",
      borderRadius: 8,
      overflow: "hidden",
    },
    itemText: {
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
  });

const Feed = React.memo(() => {
  const navigation = useNavigation();
  const { isDarkMode } = useApp();
  const [casts, setCasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const nextTokensRef = useRef({});
  const channelRef = useRef(null);

  const route = useRoute();
  const { channel, channelDescription, channelImage } = route.params || {};
  const styles = useMemo(() => createStyles(isDarkMode), [isDarkMode]);

  const addCasts = useCallback((newCasts) => {
    setCasts((prevCasts) => {
      const castMap = new Map(prevCasts.map((cast) => [cast.hash, cast]));
      newCasts.forEach((cast) => castMap.set(cast.hash, cast));
      return Array.from(castMap.values());
    });
  }, []);

  const fetchInitialCasts = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    const channelToStart = getRandomChannels(1);

    fetchSomeChannelCasts(channelToStart, DEFAULT_PAGE_SIZE_INITIAL, {}).then(
      (response) => {
        const sortedCasts = sortByScore(response.data);
        addCasts(sortedCasts);
        nextTokensRef.current[channelToStart] = response.next?.cursor;
      }
    );

    setLoading(false);
  }, [loading, addCasts]);

  const debouncedFetchCasts = useCallback(
    _.debounce(async () => {
      if (loading) return;
      setLoading(true);

      const channelsToQuery = channel ? [channel] : getRandomChannels();
      const pageSize = channel
        ? DEFAULT_PAGE_SIZE_FOR_CHANNEL
        : Math.ceil(
            Dimensions.get("window").height /
              (Dimensions.get("window").width / 2)
          ) * 2;

      try {
        await Promise.all(
          channelsToQuery.map(async (chan) => {
            const response = await fetchSomeChannelCasts(chan, pageSize, {
              pageToken: nextTokensRef.current
                ? nextTokensRef.current[chan]
                : null,
            });
            const sortedCasts = sortByScore(response.data);
            addCasts(sortedCasts);
            nextTokensRef.current[chan] = response.next?.cursor;
          })
        );
      } catch (error) {
        console.error("Error fetching casts:", error);
      } finally {
        setLoading(false);
      }
    }, 1000),
    [channel, loading, addCasts]
  );

  useEffect(() => {
    if (!channel) return;

    if (channel !== channelRef.current) {
      setCasts([]);
      nextTokensRef.current = {};
      channelRef.current = channel;
      debouncedFetchCasts();
    }

    return () => {
      debouncedFetchCasts.cancel();
    };
  }, [channel, debouncedFetchCasts]);

  useEffect(() => {
    if (casts.length > 0) return;

    fetchInitialCasts();
  }, [casts]);

  const renderHeader = useCallback(() => {
    if (!channel) return null;
    return (
      <View
        className={`flex-row p-2 ${
          isDarkMode ? "bg-black" : "bg-white"
        } border-b border-[#333] items-center relative`}
      >
        <Image
          source={{ uri: channelImage }}
          className="w-12 h-12 rounded-full bg-black"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text
            className={`text-lg font-bold ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            {channel}
          </Text>
          <Text
            className={`text-sm ${
              isDarkMode ? "text-[#BBBBBB]" : "text-gray-600"
            }`}
          >
            {channelDescription}
          </Text>
        </View>
        <TouchableOpacity
          className="absolute top-0 right-0 p-2"
          onPress={navigation.goBack}
        >
          <Ionicons
            name="close"
            size={24}
            color={isDarkMode ? "#FFFFFF" : "#000000"}
          />
        </TouchableOpacity>
      </View>
    );
  }, [channel, channelImage, channelDescription, navigation, isDarkMode]);

  const renderItem = useCallback(
    ({ item }) => <RenderCast item={item} channel={channel} styles={styles} />,
    [channel, styles]
  );

  const keyExtractor = useCallback((item) => item.hash, []);

  return (
    <View
      className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`}
      style={{ paddingTop: HEADER_HEIGHT }}
    >
      <MasonryList
        data={casts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={debouncedFetchCasts}
        onEndReachedThreshold={4}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.container}
        refreshing={loading}
        onRefresh={debouncedFetchCasts}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        initialNumToRender={50}
        removeClippedSubviews
        maxToRenderPerBatch={20}
        ListFooterComponent={
          <ActivityIndicator
            size="large"
            color="#000"
            style={{ paddingVertical: 20 }}
          />
        }
      />
    </View>
  );
});

export default Feed;
