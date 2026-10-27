import api from "./api.js";

const API_ENDPOINT = "/auth/v1";
// gotrue api endpoint

const signUp = async (email, password) => {
  try {
    const response = await api.post(`${API_ENDPOINT}/signup`, {
      email,
      password,
    });
    return response.data.user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};
const signIn = async (email, password) => {
  try {
    const response = await api.post(
      `${API_ENDPOINT}/token?grant_type=password`,
      { email, password },
    );

    const { user, access_token, refresh_token } = await response.data;

    return {
      user,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};
const signOut = async () => {
  try {
    await api.post(`${API_ENDPOINT}/signout`);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export { signUp, signIn, signOut };
