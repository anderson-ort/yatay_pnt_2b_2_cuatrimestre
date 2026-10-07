import api from "./api";


const signIn = async (email, password) => {
  try {
    const response = await api.post('/auth/v1/token?grant_type=password', {
      email,
      password,
    });

    return response.data.user;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

const signUp = async (email, password) => {
  try {
    const response = await api.post('/auth/v1/signup', {
      email,
      password,
    });

    return response.data.user;

  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
}


const logOut = async () => { }


export { signIn, signUp, logOut }; 