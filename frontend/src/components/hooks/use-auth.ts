// src/hooks/useAuth.ts
export function useAuth() {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
  
    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  }
  