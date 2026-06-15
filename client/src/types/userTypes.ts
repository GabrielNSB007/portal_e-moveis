export interface LoginUser {
    email: string;
    password: string;
}

export interface RegisterUser {
    email: string;
    password: string;
    name: string;
    phone?: string;
    userRole?: string;
}

export interface UpdateUser {
    email?: string;
    name?: string;
    password?: string;
    phone?: string;
}

export interface ReadUser {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    userRole?: string;
}

export interface AuthResponse {
    token: string;
}