import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import func2url from "../../backend/func2url.json";

const AUTH_URL = func2url.auth;

type Mode = "login" | "register";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [studentName, setStudentName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [teacherLogin, setTeacherLogin] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (role === "teacher" && mode === "register") {
      const res = await fetch(`${AUTH_URL}/register-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: teacherLogin, password: teacherPassword, name: teacherName }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error || "Ошибка регистрации"); return; }
      setSuccess("Аккаунт создан! Теперь войдите.");
      setMode("login");
      return;
    }

    const body =
      role === "teacher"
        ? { role: "teacher", login: teacherLogin, password: teacherPassword }
        : { role: "student", name: studentName, access_code: accessCode };

    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка входа");
      return;
    }

    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_role", data.role);
    localStorage.setItem("auth_name", data.name);

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="p-6">
        <Link to="/" className="text-sm uppercase tracking-wide font-bold text-neutral-900">
          РусЯз
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {role === "teacher" && mode === "register" ? "Регистрация учителя" : "Войти в платформу"}
          </h1>
          <p className="text-neutral-500 mb-8">
            {role === "student" ? "Введите данные, которые вам прислал учитель" : mode === "register" ? "Создайте аккаунт учителя" : "Введите ваши данные для входа"}
          </p>

          <div className="flex mb-8 border border-neutral-200 bg-white p-1 gap-1">
            <button
              onClick={() => { setRole("student"); setError(""); }}
              className={`flex-1 py-2 text-sm uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
                role === "student" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Ученик
            </button>
            <button
              onClick={() => { setRole("teacher"); setError(""); }}
              className={`flex-1 py-2 text-sm uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
                role === "teacher" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Учитель
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {role === "student" && (
              <>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">
                    Имя ученика
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Иван Петров"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">
                    Код доступа
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Код из письма учителя"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors uppercase"
                  />
                </div>
              </>
            )}

            {role === "teacher" && (
              <>
                {mode === "register" && (
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">Ваше имя</label>
                    <input
                      type="text"
                      required
                      placeholder="Как вас зовут?"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">Логин</label>
                  <input
                    type="text"
                    required
                    placeholder="Ваш логин"
                    value={teacherLogin}
                    onChange={(e) => setTeacherLogin(e.target.value)}
                    className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">Пароль</label>
                  <input
                    type="password"
                    required
                    placeholder="Ваш пароль"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>
              </>
            )}

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-3">{error}</p>
            )}
            {success && (
              <p className="text-green-700 text-sm bg-green-50 border border-green-200 px-4 py-3">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-neutral-900 text-white py-3 text-sm uppercase tracking-widest font-semibold hover:bg-neutral-700 transition-colors duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Подождите..." : role === "teacher" && mode === "register" ? "Зарегистрироваться" : "Войти"}
            </button>
          </form>

          {role === "student" && (
            <p className="mt-6 text-sm text-neutral-400 text-center">
              Нет кода? Обратитесь к своему учителю
            </p>
          )}

          {role === "teacher" && (
            <p className="mt-6 text-sm text-neutral-400 text-center">
              {mode === "login" ? (
                <>Нет аккаунта?{" "}
                  <button onClick={() => { setMode("register"); setError(""); setSuccess(""); }} className="text-neutral-700 underline cursor-pointer">
                    Зарегистрироваться
                  </button>
                </>
              ) : (
                <>Уже есть аккаунт?{" "}
                  <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className="text-neutral-700 underline cursor-pointer">
                    Войти
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}