// src/pages/RegisterPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/api/auth";
import type { HttpError } from "@/api/http";
import "@/styles/main.css";     // 如果沒有樣式，可移除
import "@/styles/register.css"; // 同上

// === Schema & Types ===
const schema = z.object({
  cname: z.string().min(1, "公司名稱必填"),
  taxId: z.string().optional(),                         // 統編選填
  isApplying: z.coerce.boolean().default(false),        // checkbox -> boolean
  rname: z.string().min(1, "負責人姓名必填"),
  rtel: z.string().min(1, "負責人手機必填"),
  email: z.string().email("Email 格式錯誤"),
  account: z.string().min(4, "帳號至少 4 碼"),
  password: z.string().min(6, "密碼至少 6 碼"),
});
type FormValues = z.infer<typeof schema>;

// === Component ===
export default function RegisterPage() {
  const nav = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cname: "",
      taxId: "",
      isApplying: false,
      rname: "",
      rtel: "",
      email: "",
      account: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (v) => {
	try {
	    await registerUser(v);
	    alert("註冊成功，請登入");
	    nav("/login");
	  } catch (e) {
	    const err = e as HttpError;
	    alert(err.response?.data?.message ?? err.message ?? "註冊失敗");
	  }
  };

  return (
    <div className="wrap">
      {/* Navbar */}
      <div className="navbar">
        <Link className="logo" to="/">
          <img className="logoimg" src="/img/presentation.png" alt="logo" />
          柴務豹表
        </Link>
        <Link to="/login">
          <button type="button" className="loginBtn">登入</button>
        </Link>
      </div>

      {/* Form */}
      <div className="container">
        <form className="regForm" onSubmit={handleSubmit(onSubmit)}>
          <h1>註冊帳號</h1>
          <hr />
          <span className="content">
            <label>公司名稱</label>
            <input type="text" placeholder="公司名稱" className="input-full" {...register("cname")} />
            <p className="error">{errors.cname?.message}</p>

			{/* 公司統編（選填） + 右側 checkbox */}
			<label>公司統編（選填）</label>
			<div className="tax-row">
			  <input
			    type="text"
			    placeholder="公司統編"
			    className="input tax-input"
			    {...register("taxId")}
			  />
			  <label className="inline-checkbox">
			    <input type="checkbox" {...register("isApplying")} />
			    公司申請中 / 尚未申請公司
			  </label>
			</div>


            <label>負責人姓名</label>
            <input type="text" placeholder="負責人姓名" className="input-full" {...register("rname")} />
            <p className="error">{errors.rname?.message}</p>

            <label>負責人手機</label>
            <input type="tel" placeholder="手機" className="input-full" {...register("rtel")} />
            <p className="error">{errors.rtel?.message}</p>

            <label>電子信箱</label>
            <input type="email" autoComplete="email" placeholder="Email" className="input-full" {...register("email")} />
            <p className="error">{errors.email?.message}</p>

            <label>登入帳號</label>
            <input type="text" placeholder="帳號" className="input-full" {...register("account")} />
            <p className="error">{errors.account?.message}</p>

            <label>設定密碼</label>
            <div className="inputGroup">
              <input
                type={showPwd ? "text" : "password"}
				autoComplete="new-password"
                placeholder="密碼"
				className="input-full"
                {...register("password")}
              />
              <span
                className="inputGroupImg"
                onClick={() => setShowPwd((s) => !s)}
                title={showPwd ? "隱藏密碼" : "顯示密碼"}
                style={{ cursor: "pointer" }}
              >
                <img id="eyeIcon" src="/img/eye.png" alt="toggle" />
              </span>
            </div>
            <p className="error">{errors.password?.message}</p>

            <button id="submitBtn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "送出中…" : "確認註冊"}
            </button>
            <p className="note">
              點選「確認」即表示同意 <a href="#">使用者條款</a> 與 <a href="#">隱私權政策</a>
            </p>
          </span>
        </form>
      </div>

      <div className="footer">
        <p>© 2025 柴務豹表 All rights reserved.</p>
      </div>
    </div>
  );
}
