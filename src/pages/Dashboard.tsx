import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

interface AuthState {
  name: string;
  role: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("auth_role");
    const name = localStorage.getItem("auth_name");
    if (!token || !role || !name) {
      navigate("/login");
      return;
    }
    setAuth({ role, name });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_name");
    navigate("/login");
  };

  if (!auth) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-sm uppercase tracking-wide font-bold text-neutral-900">РусЯз</Link>
        <div className="flex items-center gap-6">
          <span className="text-sm text-neutral-500">
            {auth.role === "teacher" ? "Учитель" : "Ученик"} · <span className="text-neutral-900 font-medium">{auth.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm uppercase tracking-wide text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Добро пожаловать, {auth.name}!
        </h1>
        <p className="text-neutral-500 mb-10">
          {auth.role === "teacher"
            ? "Здесь вы можете управлять учениками и назначать задания."
            : "Здесь будут ваши задания и результаты самоанализа."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auth.role === "teacher" ? (
            <>
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="font-semibold text-neutral-900 mb-2">Ученики</h2>
                <p className="text-sm text-neutral-500 mb-4">Добавляйте учеников и выдавайте им коды доступа</p>
                <span className="text-xs uppercase tracking-wide text-neutral-400">Скоро</span>
              </div>
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="font-semibold text-neutral-900 mb-2">Задания</h2>
                <p className="text-sm text-neutral-500 mb-4">Создавайте и отправляйте индивидуальные задания</p>
                <span className="text-xs uppercase tracking-wide text-neutral-400">Скоро</span>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="font-semibold text-neutral-900 mb-2">Мои задания</h2>
                <p className="text-sm text-neutral-500 mb-4">Задания, которые отправил учитель</p>
                <span className="text-xs uppercase tracking-wide text-neutral-400">Скоро</span>
              </div>
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="font-semibold text-neutral-900 mb-2">Самоанализ</h2>
                <p className="text-sm text-neutral-500 mb-4">Анализ ошибок и прогресс по темам</p>
                <span className="text-xs uppercase tracking-wide text-neutral-400">Скоро</span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
