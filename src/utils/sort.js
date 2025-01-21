import { CURATED_CHANNELS } from "../consts/channels";

const calculateAestheticScore = async (cast) => {
  let score = 0;

  // Prioritize casts with embeds (images or videos)
  score += cast.embeds?.some((embed) => isImageOrVideoURL(embed.url)) ? 10 : 0;

  // Consider text length
  if (cast.text) {
    if (cast.text.length > 100) score += 5;
    else if (cast.text.length > 50) score += 3;
    else score += 1;
  }

  // Consider reactions
  const reactionCount = cast.reactions?.length || 0;
  score += Math.min(reactionCount * 2, 10); // Cap at 10 points

  // Consider recasts
  score += cast.recasts?.length || 0;

  // Consider likes
  score += cast.likes?.length || 0;

  // Boost score for casts from curated channels
  if (CURATED_CHANNELS.includes(cast.channel)) {
    score += 15;
  }

  // Add a small random factor for variety
  score += Math.random() * 5;

  return score;
};

const isImageOrVideoURL = (url) => {
  if (!url) return false;

  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  const videoExtensions = [".mp4", ".mov", ".avi", ".wmv", ".webm"];
  const domains = ["imagedelivery.net"];

  const urlLower = url.toLowerCase();
  return (
    imageExtensions.some((ext) => urlLower.endsWith(ext)) ||
    videoExtensions.some((ext) => urlLower.endsWith(ext)) ||
    domains.some((domain) => urlLower.includes(domain))
  );
};

const filterCastsWithImagesOrVideos = (casts) => {
  return casts.filter((cast) =>
    cast.embeds?.some((embed) => isImageOrVideoURL(embed.url))
  );
};

export const sortByScore = (casts) => {
  const filtered = filterCastsWithImagesOrVideos(casts);

  return [...filtered].sort((a, b) => {
    const aScore = calculateAestheticScore(a);
    const bScore = calculateAestheticScore(b);
    return bScore - aScore;
  });
};

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
