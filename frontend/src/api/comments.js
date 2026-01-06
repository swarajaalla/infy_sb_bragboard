import axiosClient from "./axiosClient";

export const getComments = (shoutoutId) => {
  return axiosClient.get("/api/comments", {
    params: { shoutout_id: shoutoutId },
  });
};

export const createComment = (shoutoutId, content) => {
  return axiosClient.post("/api/comments", {
    shoutout_id: shoutoutId,
    content,
  });
};

export const deleteComment = (commentId) => {
  return axiosClient.delete(`/api/comments/${commentId}`);
};
