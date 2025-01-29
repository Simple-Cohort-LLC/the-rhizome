import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import {
  fetchRepliesForCast,
  fetchUserFollows,
  followUser,
  submitReaction,
} from "../../api/Backend";
import Replies from "../organisms/Replies";
import { ReactionTypes } from "../../consts/reactions";

const Avatar = ({ url, style, following, target, setIsFollowing }) => {
  const { signerUuid } = useApp();
  const [error, setError] = useState(false);

  if (error || !url) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: "#4a5568",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
          },
        ]}
      >
        <Ionicons name="person" size={24} color="#a0aec0" />
      </View>
    );
  }

  const handleFollow = async () => {
    followUser(signerUuid, target).then((res) => {
      if (res.error) {
        Alert.alert("Error", "Error following cast author.");
      } else {
        setIsFollowing(true);
      }
    });
  };

  return (
    <View>
      <Image
        source={{ uri: url }}
        style={[style, { zIndex: 1 }]}
        onError={() => setError(true)}
      />
      {!following && (
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: -10,
            right: 0,
            padding: 5,
            zIndex: 2,
          }}
          onPress={handleFollow}
        >
          <Ionicons name="add-circle" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const CastDetail = ({ route }) => {
  const { fid, signerUuid } = useApp();
  const { cast } = route.params;
  const navigation = useNavigation();

  const {
    hash,
    author: { display_name, pfp_url, username, fid: authorFid },
    reactions: { likes, recasts, likes_count, recasts_count },
    replies: { count: replies_count },
    embeds,
    channel,
    channelImage,
  } = cast;

  const [isLiked, setIsLiked] = useState(false);
  const [isRecasted, setIsRecasted] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [expandBio, setExpandBio] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);

  useEffect(() => {
    if (likes.some((like) => like.fid == fid)) {
      setIsLiked(true);
    }
    if (recasts.some((recast) => recast.fid == fid)) {
      setIsRecasted(true);
    }
  }, [likes, recasts, fid]);

  useEffect(() => {
    const fetchReplies = async () => {
      setLoadingReplies(true);
      try {
        const fetchedReplies = await fetchRepliesForCast(hash);
        setReplies(fetchedReplies);
      } catch (error) {
        console.error("Error fetching replies:", error);
      } finally {
        setLoadingReplies(false);
      }
    };

    fetchReplies();
  }, [hash]);

  useEffect(() => {
    const fetchFollows = async () => {
      try {
        const userFollows = await fetchUserFollows(fid, authorFid);
        setIsFollowing(userFollows.users[0].viewer_context.following);
      } catch (error) {
        console.error("Error fetching user follows:", error);
      }
    };

    if (fid && authorFid) fetchFollows();
  }, [fid, authorFid]);

  const postReaction = async (reactionType) => {
    submitReaction(signerUuid, hash, reactionType).then((res) => {
      if (res.error) {
        return;
      }

      if (reactionType === ReactionTypes.Like) {
        setIsLiked(!isLiked);
      } else if (reactionType === ReactionTypes.Recast) {
        setIsRecasted(!isRecasted);
      }
    });
  };

  const handleLike = () => {
    postReaction(ReactionTypes.Like);
  };

  const handleRecast = () => {
    postReaction(ReactionTypes.Recast);
  };

  const navigateToChannel = () => {
    if (channel) {
      navigation.navigate("Feed", {
        channel: typeof channel === "object" ? channel.name : channel,
        channelDescription: channel?.description || "",
        channelImage: channel?.image_url || channelImage,
        channelFollowers: channel?.follower_count || 0,
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        <Image source={{ uri: embeds[0].url }} style={styles.castImage} />
      </View>

      <View style={styles.infoContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.authorContainer}>
            <Avatar
              url={pfp_url}
              style={styles.pfp}
              following={isFollowing}
              target={authorFid}
              setIsFollowing={setIsFollowing}
            />
            <View style={styles.authorDetails}>
              <Text style={styles.displayName}>{display_name}</Text>
              <Text style={styles.username}>@{username}</Text>
              {channel && (
                <TouchableOpacity onPress={navigateToChannel}>
                  <Text style={styles.channel}>
                    /{typeof channel === "object" ? channel.name : channel}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.bioContainer}>
            <Text
              style={styles.castText}
              numberOfLines={expandBio ? undefined : 1}
            >
              {cast.text}
            </Text>
            {cast.text.length > 40 && (
              <TouchableOpacity onPress={() => setExpandBio(!expandBio)}>
                <Text style={styles.expandButton}>
                  {expandBio ? "[-]" : "[+]"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.reactionButton, isLiked && styles.likedButton]}
              onPress={handleLike}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "red" : "white"}
              />
              <Text style={styles.reactionCount}>{likes_count}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.reactionButton,
                isRecasted && styles.recastedButton,
              ]}
              onPress={handleRecast}
            >
              <Ionicons
                name="repeat"
                size={24}
                color={isRecasted ? "green" : "white"}
              />
              <Text style={styles.reactionCount}>{recasts_count}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reactionButton}
              onPress={() => setShowReplies(true)}
            >
              <Ionicons name="chatbubble-outline" size={24} color="white" />
              <Text style={styles.reactionCount}>{replies_count}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {showReplies &&
        (loadingReplies ? (
          <></>
        ) : (
          <Replies replies={replies} close={() => setShowReplies(false)} />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: Platform.OS === "ios" ? 60 : 35,
    backgroundColor: "#1E1E1E",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1999,
  },
  imageContainer: {
    width: "100%",
    height: "75%",
    justifyContent: "center",
    alignItems: "center",
  },
  castImage: {
    width: "95%",
    height: "70%",
    maxWidth: "95%",
    maxHeight: "70%",
    resizeMode: "contain",
  },
  infoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "25%",
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
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
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  username: {
    fontSize: 14,
    color: "#BBBBBB",
  },
  channel: {
    fontSize: 14,
    color: "#BBBBBB",
    marginTop: 2,
  },
  bioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  castText: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  expandButton: {
    fontSize: 16,
    color: "#BBBBBB",
    marginLeft: 8,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionCount: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  likedButton: {
    backgroundColor: "#3A1212",
    borderRadius: 10,
    padding: 5,
  },
  recastedButton: {
    backgroundColor: "#12243A",
    borderRadius: 10,
    padding: 5,
  },
});

export default CastDetail;
