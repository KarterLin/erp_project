import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8080", // 後端實際 base URL，若有 context-path 要加
  withCredentials: true,            // cookie-based 必開
});

export default http; // ✅ 用 default 匯出
