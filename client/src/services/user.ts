import type {
    LoginUser,
    RegisterUser,
    UpdateUser,
    ReadUser,
    AuthResponse,
} from "@/types/user";
import api from "./api";

const TOKEN_KEY = "emoveis-token";

const getTokenFromResponse = (data: AuthResponse | string) => {
    if (typeof data === "string") {
        return data;
    }

    return data.token;
};

export const saveUserToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getUserToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const removeUserToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const loginUser = async (userData: LoginUser) => {
    const response = await api.post<AuthResponse | string>("/auth/login", userData);

    const token = getTokenFromResponse(response.data);

    if (token) {
        saveUserToken(token);
    }

    return response;
};

export const registerUser = async (userData: RegisterUser) => {
    const response = await api.post<AuthResponse | string>("/auth/register", userData);

    const token = getTokenFromResponse(response.data);

    if (token) {
        saveUserToken(token);
    }

    return response;
};

export const findUserProfile = async () => {
    return api.get<ReadUser>("/auth/profile");
};

export const updateUserProfile = async (userData: UpdateUser) => {
    return api.put<ReadUser>("/auth/profile", userData);
};

export const deleteUserProfile = async () => {
    return api.delete("/auth/profile");
};

export const logoutUser = () => {
    removeUserToken();
};