import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState<"student" | "teacher">("student");

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="p-6">
        <Link to="/" className="text-sm uppercase tracking-wide font-bold text-neutral-900">
          РусЯз
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Войти в платформу</h1>
          <p className="text-neutral-500 mb-8">Введите данные, которые вам прислал учитель</p>

          {/* Переключатель роли */}
          <div className="flex mb-8 border border-neutral-200 bg-white p-1 gap-1">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 py-2 text-sm uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
                role === "student"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Ученик
            </button>
            <button
              onClick={() => setRole("teacher")}
              className={`flex-1 py-2 text-sm uppercase tracking-wide transition-colors duration-200 cursor-pointer ${
                role === "teacher"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Учитель
            </button>
          </div>

          <form className="flex flex-col gap-4">
            {role === "student" && (
              <div>
                <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">
                  Имя ученика
                </label>
                <input
                  type="text"
                  placeholder="Например: Иван Петров"
                  className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">
                {role === "student" ? "Код доступа" : "Логин"}
              </label>
              <input
                type={role === "teacher" ? "text" : "password"}
                placeholder={role === "student" ? "Код из письма учителя" : "Ваш логин"}
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>

            {role === "teacher" && (
              <div>
                <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  placeholder="Ваш пароль"
                  className="w-full border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              className="mt-2 bg-neutral-900 text-white py-3 text-sm uppercase tracking-widest font-semibold hover:bg-neutral-700 transition-colors duration-300 cursor-pointer"
            >
              Войти
            </button>
          </form>

          {role === "student" && (
            <p className="mt-6 text-sm text-neutral-400 text-center">
              Нет кода? Обратитесь к своему учителю
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
