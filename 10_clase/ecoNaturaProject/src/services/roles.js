// Se lo dejo por aca!

import api from "./api.js";

const getRoleByUserId = async (userId,token=null) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

  const response = await api.get(`/rest/v1/user_roles`, {
    params: { user_id: `eq.${userId}`, select: "role" },
    ...config
  });

  console.log({ id: userId });
  console.log("Respuesta de Supabase:", response.data);

  return response.data[0]?.role ?? null;
};

export default getRoleByUserId;

