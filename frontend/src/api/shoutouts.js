// src/api/shoutouts.js
import axiosClient from "./axiosClient";

export const getShoutouts = () => {
  return axiosClient.get("/api/shoutouts");
};

export const createShoutout = (data) => {
  return axiosClient.post("/api/shoutouts", data);
};
