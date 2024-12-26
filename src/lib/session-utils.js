import { jwtDecode } from "jwt-decode";

export const getUsernameFromToken = (token) => {
    const decoded = jwtDecode(token);
    return decoded.user;
}
