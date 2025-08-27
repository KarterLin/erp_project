// LoginPage.tsx（替換你的檔案主要差異處）
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/api/auth";
import type { HttpError } from "@/api/http";
import { Link, useNavigate } from "react-router-dom";
import "@/styles/main.css";
import "@/styles/register.css";

const schema = z.object({
  email: z.string().email("Email 格式錯誤"),
  password: z.string().min(1, "請輸入密碼"),
  remember: z.boolean().optional(),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const nav = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const pwdRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  // 載入「記住帳號」
  useEffect(() => {
    const saved = localStorage.getItem("erp_login_saved");
    if (saved) {
      const { email } = JSON.parse(saved);
      setValue("email", email);
      setValue("remember", true);
    }
  }, [setValue]);

  const onSubmit = async (v: Form) => {
    try {
      await login({ email: v.email, password: v.password }); // cookie-based，不需 setAccessToken
      if (v.remember) {
        localStorage.setItem("erp_login_saved", JSON.stringify({ email: v.email }));
      } else {
        localStorage.removeItem("erp_login_saved");
      }
      nav("/");
    } catch (e) {
      const err = e as HttpError;
      alert(err.response?.data?.message ?? err.message ?? "登入失敗");
    }
  };

  return (
    <div className="wrap">
      <div className="navbar">
        <Link className="logo" to="/">
          <img className="logoimg" src="/img/presentation.png" alt="logo" />
          柴務豹表
        </Link>
        <Link to="/register">
          <button type="button" className="registerBtn">註冊</button>
        </Link>
      </div>

      <div className="container">
        <form className="regForm" onSubmit={handleSubmit(onSubmit)}>
          <h1>使用者登入</h1>
          <hr />
          <span className="content">
            <label>請輸入信箱</label>
            <input type="email" autoComplete="email" placeholder="輸入帳號" className="input-full" {...register("email")} />
            <p className="error">{errors.email?.message}</p>

            <label>請輸入密碼</label>
            <div className="inputGroup">
              <input
                ref={pwdRef}
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                placeholder="輸入密碼"
                className="input-full"
                {...register("password")}
              />
              <span
                className="inputGroupImg"
                onClick={() => setShowPwd((s) => !s)}
                style={{ cursor: "pointer" }}
                title={showPwd ? "隱藏密碼" : "顯示密碼"}
              >
                <img id="eyeIcon" src="/img/eye.png" alt="toggle" />
              </span>
            </div>
            <p className="error">{errors.password?.message}</p>

            <label className="checkboxLabel checkbox1">
              <input type="checkbox" {...register("remember")} />
              記住帳號
            </label>

            <button id="loginBtn" type="submit" disabled={isSubmitting} style={{ marginTop: 12 }}>
              {isSubmitting ? "登入中…" : "登入"}
            </button>

            <div className="help">
              <a href="#">忘記密碼?</a>
            </div>
          </span>
        </form>
      </div>

      <div className="footer">
        <p>© 2025 柴務豹表 All rights reserved.</p>
      </div>
    </div>
  );
}
