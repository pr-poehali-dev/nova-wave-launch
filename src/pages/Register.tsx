import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import func2url from "../../backend/func2url.json";

const AUTH_URL = func2url.auth;

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`${AUTH_URL}/register-teacher`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, login, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка регистрации");
      return;
    }

    navigate("/login");
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Регистрация учителя</h1>
          <p className="text-neutral-500 mb-8">Создайте аккаунт, чтобы добавлять учеников и задания</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">
                Ваше имя
              </label>
              <input
                type="text"
                required
                placeholder="Например: Мария Ивановна"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">
                Логин
              </label>
              <input
                type="text"
                required
                placeholder="Придумайте логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">
                Пароль
              </label>
              <input
                type="password"
                required
                placeholder="Минимум 6 символов"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-neutral-900 text-white py-3 text-sm uppercase tracking-widest font-semibold hover:bg-neutral-700 transition-colors duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="mt-6 text-sm text-neutral-400 text-center">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-neutral-700 underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
