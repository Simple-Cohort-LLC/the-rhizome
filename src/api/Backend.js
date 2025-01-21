import { API_URL } from "../consts/api";
import { fetchWithHeaders } from "../utils/fetchWithHeaders";
import { uploadImageToImgur } from "../utils/imgur";

export const fetchAuthorizationUrl = async () => {
  const res = await fetchWithHeaders(`${API_URL}/get-auth-url`);
  if (!res.ok) {
    throw new Error("Failed to fetch auth url");
  }
  const { authorization_url } = await res.json();
  return authorization_url;
};

export const fetchRepliesForCast = async (hash) => {
  const res = await fetchWithHeaders(`${API_URL}/replies?hash=${hash}`);
  if (!res.ok) {
    throw new Error("Failed to fetch replies");
  }
  const { directReplies } = await res.json();
  return directReplies;
};

export const submitCast = async (text, signerUuid, imageUris, channel) => {
  try {
    const imgurLinks = await Promise.all(
      imageUris.map(async (uri) => {
        const link = await uploadImageToImgur(uri.base64);
        return link;
      })
    );

    const response = await fetchWithHeaders(`${API_URL}/cast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signerUuid,
        text,
        channel,
        embeds: imgurLinks,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
    return { error: "Server error" };
  }
};

export const submitReaction = async (signerUuid, hash, reaction) => {
  try {
    const response = await fetchWithHeaders(`${API_URL}/reaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signerUuid,
        hash,
        reaction,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return { error: "Server error" };
  }
};

export const fetchUserCasts = async (fid) => {
  const res = await fetchWithHeaders(`${API_URL}/user/casts?fid=${fid}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user casts");
  }
  const { casts } = await res.json();
  return casts;
};

export const fetchUserChannelMemberships = async (fid) => {
  const res = await fetchWithHeaders(
    `${API_URL}/user/channel/memberships?fid=${fid}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch user channels");
  }
  const { data } = await res.json();
  return data;
};

export const followUser = async (signerUuid, followeeFid) => {
  try {
    const response = await fetchWithHeaders(`${API_URL}/user/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signerUuid,
        followeeFid,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return { error: "Server error" };
  }
};

export const unfollowUser = async (signerUuid, followeeFid) => {
  try {
    const response = await fetchWithHeaders(`${API_URL}/user/unfollow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signerUuid,
        followeeFid,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error unfollowing user:", errorData);
      return { error: errorData };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
    return { error: "Server error" };
  }
};

export const fetchZora = async () => {
  const res = await fetchWithHeaders(`${API_URL}/zora`);
  if (!res.ok) {
    throw new Error("Failed to fetch Zora");
  }
  return res.json();
};

export const fetchSomeChannelCasts = async (
  channel,
  pageSize,
  { fid = null, pageToken = null }
) => {
  const params = new URLSearchParams();
  params.append("channel", channel);
  params.append("pageSize", pageSize);
  if (fid) params.append("fid", fid);
  if (pageToken) params.append("pageToken", pageToken);

  const url = `${API_URL}/feed?${params.toString()}`;

  const response = await fetchWithHeaders(url);

  if (!response.ok) {
    throw new Error("Failed to fetch channel casts");
  }

  const result = await response.json();

  return result;
};

export const fetchChannel = async (channel) => {
  const response = await fetchWithHeaders(
    `${API_URL}/channel-feed?channel=${channel}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch channel");
  }

  const result = await response.json();
  return result;
};
