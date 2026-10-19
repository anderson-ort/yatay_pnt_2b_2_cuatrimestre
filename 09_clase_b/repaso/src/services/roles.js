// Se lo dejo por aca!

import api from "./api.js"

const getRoleByUserId = async (userId) => {
    console.log(userId)

    const response = await api.get(`/rest/v1/user_roles`, {
        params: { user_id: `eq.${userId}`, select: "role" }
    })

    console.log(response.data);
    

    return response.data[0]?.role ?? null
}

export default getRoleByUserId 