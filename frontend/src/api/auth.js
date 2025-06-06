import axios from "axios";

const BASE_URL = "http://localhost:8000/api"; // update if needed

export const signup = async (userData) => {
  const res = await axios.post(`${BASE_URL}/auth/register`, userData, {
    withCredentials: true, // cookie support (for login session later)
  });
  return res.data;
};
