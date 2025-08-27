// auth.ts
import  http  from "@/api/http";

// 登入：後端要 { uEmail, password }，路徑 /api/v1/auth/authenticate
export function login(input: { email: string; password: string }) {
  return http.post("/api/v1/auth/authenticate", {
    uEmail: input.email,
    password: input.password,
  });
}

// 註冊：後端要 /api/register + 指定的 key，包含 role
export function registerUser(v: {
  cname: string;
  taxId?: string;
  isApplying?: boolean;
  rname: string;
  rtel: string;
  email: string;
  account: string;
  password: string;
}) {
  return http.post("/api/register", {
    cName: v.cname,
    taxId: v.taxId ?? "",
    rName: v.rname,
    rTel: v.rtel,
    uAccount: v.account,
    uEmail: v.email,
    password: v.password,
    role: "ADMIN",
    // 如需 isApplying，請先改後端 DTO 再一併加入
  });
}

// 其他（如需）：
export const refreshToken = () => http.post("/api/v1/auth/refresh-token-cookie");
export const logout = () => http.post("/api/v1/auth/logout");

