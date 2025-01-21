import React, { useCallback, useEffect, useState, useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { sortByScore } from "../../utils/sort";
import {
  DEFAULT_THUMBNAIL_SEARCH,
  CHANNEL_GROUPS,
} from "../../consts/channels";
import CategoryCarousel from "../organisms/CategoryCarousel";
import { fetchChannel, fetchSomeChannelCasts } from "../../api/Backend";
import { HEADER_HEIGHT } from "../organisms/Header";

const Explore = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(new Set());

  const fetchSingleChannel = useCallback(async (channel) => {
    if (loadingChannels.has(channel)) return;

    setLoadingChannels((prev) => new Set(prev).add(channel));

    try {
      const [channelResponse, castsResponse] = await Promise.all([
        fetchChannel(channel),
        fetchSomeChannelCasts(channel, DEFAULT_THUMBNAIL_SEARCH, {}),
      ]);

      const sortedCasts = sortByScore(castsResponse.data);

      setChannels((prevChannels) => {
        const filteredChannels = prevChannels.filter((c) => c.name !== channel);

        return [
          ...filteredChannels,
          {
            name: channel,
            description: channelResponse.channel.description,
            followers: channelResponse.channel.follower_count,
            image_url: channelResponse.channel.image_url,
            thumbnail: sortedCasts[0]?.embeds[0]?.url,
          },
        ];
      });
    } catch (error) {
      console.error(`Failed to fetch casts for ${channel}:`, error);
    } finally {
      setLoadingChannels((prev) => {
        const next = new Set(prev);
        next.delete(channel);
        return next;
      });
    }
  }, []);

  const fetchCasts = useCallback(() => {
    if (loading) return;
    setLoading(true);

    const allChannels = Object.values(CHANNEL_GROUPS).flat();

    allChannels.forEach((channel) => {
      fetchSingleChannel(channel);
    });

    setTimeout(() => setLoading(false), 500);
  }, [fetchSingleChannel]);

  useEffect(() => {
    fetchCasts();
  }, [fetchCasts]);

  const groupedChannels = useMemo(() => {
    return Object.entries(CHANNEL_GROUPS).reduce(
      (acc, [category, channelList]) => {
        const categoryChannels = channelList
          .map((channelName) => {
            const channel = channels.find((c) => c.name === channelName);
            if (channel) return channel;

            if (loadingChannels.has(channelName)) {
              return {
                name: channelName,
                description: "Loading...",
                followers: 0,
                image_url: "",
                thumbnail: "",
                isLoading: true,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (categoryChannels.length > 0) {
          acc[category] = categoryChannels;
        }
        return acc;
      },
      {}
    );
  }, [channels, loadingChannels]);

  const renderChannelList = useCallback(
    () => (
      <FlatList
        data={Object.entries(groupedChannels)}
        keyExtractor={(item) => item[0]}
        renderItem={({ item: [category, channels] }) => (
          <CategoryCarousel
            category={category}
            channels={channels}
            loadingChannels={loadingChannels}
          />
        )}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    ),
    [groupedChannels, loadingChannels]
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
          style={styles.loadingContainer}
        />
      ) : (
        renderChannelList()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: HEADER_HEIGHT + 10,
  },
  searchBar: {
    height: 40,
    margin: 12,
    padding: 10,
    backgroundColor: "#2A2A2A",
    color: "#FFFFFF",
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
  },
  tabText: {
    color: "#888888",
    fontSize: 16,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
});

export default Explore;
