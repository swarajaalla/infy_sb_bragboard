import axiosClient from "./axiosClient";

export const getReactions = (shoutoutId) => {
  return axiosClient.get("/api/reactions", {
    params: { shoutout_id: shoutoutId },
  });
};

export const reactToShoutout = (shoutoutId, type) => {
  return axiosClient.post("/api/reactions", {
    shoutout_id: shoutoutId,
    type,
  });
};
