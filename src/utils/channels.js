import { CURATED_CHANNELS, MAX_CHANNELS_FOR_FEED } from "../consts/channels";

export const getRandomChannels = (max = MAX_CHANNELS_FOR_FEED) => {
  return CURATED_CHANNELS.sort(() => 0.5 - Math.random()).slice(0, max);
};
