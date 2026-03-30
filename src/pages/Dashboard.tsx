import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const STUDENTS_URL = "https://functions.poehali.dev/688169b3-204b-4a0f-8dac-b1f6590339fc";

interface AuthState {
  name: string;
  role: string;
  token: string;
}

interface Student {
  id: number;
  name: string;
  access_code: string;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("auth_role");
    const name = localStorage.getItem("auth_name");
    if (!token || !role || !name) { navigate("/login"); return; }
    setAuth({ role, name, token });
  }, [navigate]);

  useEffect(() => {
    if (auth?.role === "teacher") fetchStudents();
  }, [auth]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    const token = localStorage.getItem("auth_token") || "";
    const res = await fetch(STUDENTS_URL, {
      headers: { "X-Auth-Token": token },
    });
    const data = await res.json();
    setLoadingStudents(false);
    if (res.ok) setStudents(data.students);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setAddError("");
    const token = localStorage.getItem("auth_token") || "";
    const res = await fetch(STUDENTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) { setAddError(data.error || "Ошибка"); return; }
    setStudents((prev) => [data, ...prev]);
    setNewName("");
  };

  const copyCode = (student: Student) => {
    const text = `Привет, ${student.name}! Твой код доступа для входа на РусЯз: ${student.access_code}`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    localStorage.clear();
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

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* КАБИНЕТ УЧИТЕЛЯ */}
        {auth.role === "teacher" && (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Мои ученики</h1>
            <p className="text-neutral-500 mb-8 text-sm">Добавьте ученика — система сгенерирует уникальный код доступа</p>

            {/* Форма добавления */}
            <form onSubmit={handleAddStudent} className="flex gap-3 mb-8">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Имя ученика, например: Иван Петров"
                className="flex-1 border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors text-sm"
              />
              <button
                type="submit"
                disabled={adding || !newName.trim()}
                className="bg-neutral-900 text-white px-6 py-3 text-sm uppercase tracking-wide hover:bg-neutral-700 transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
              >
                {adding
                  ? <><Icon name="Loader2" size={14} className="animate-spin" /> Добавляю...</>
                  : <><Icon name="Plus" size={14} /> Добавить</>}
              </button>
            </form>

            {addError && (
              <p className="text-red-500 text-sm mb-4">{addError}</p>
            )}

            {/* Список учеников */}
            {loadingStudents ? (
              <div className="flex items-center gap-2 text-neutral-400 text-sm">
                <Icon name="Loader2" size={16} className="animate-spin" /> Загружаю...
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white border border-dashed border-neutral-300 p-10 text-center">
                <Icon name="Users" size={32} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">Учеников пока нет. Добавьте первого!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {students.map((s) => (
                  <div key={s.id} className="bg-white border border-neutral-200 px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-9 h-9 bg-neutral-100 flex items-center justify-center shrink-0">
                        <Icon name="User" size={16} className="text-neutral-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 text-sm truncate">{s.name}</p>
                        <p className="text-xs text-neutral-400 mt-0.5 tracking-widest font-mono">{s.access_code}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyCode(s)}
                      className="shrink-0 flex items-center gap-1.5 text-xs uppercase tracking-wide border border-neutral-200 px-3 py-2 hover:bg-neutral-50 transition-colors cursor-pointer text-neutral-600"
                    >
                      <Icon name={copiedId === s.id ? "Check" : "Copy"} size={13} />
                      {copiedId === s.id ? "Скопировано" : "Скопировать код"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* КАБИНЕТ УЧЕНИКА */}
        {auth.role === "student" && (
          <>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Привет, {auth.name}!</h1>
            <p className="text-neutral-500 mb-8 text-sm">Здесь будут твои задания и результаты самоанализа</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-neutral-200 p-6">
                <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center mb-4">
                  <Icon name="BookOpen" size={18} className="text-neutral-600" />
                </div>
                <h2 className="font-semibold text-neutral-900 mb-1">Мои задания</h2>
                <p className="text-sm text-neutral-400">Скоро появятся задания от учителя</p>
              </div>
              <div className="bg-white border border-neutral-200 p-6">
                <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center mb-4">
                  <Icon name="PenLine" size={18} className="text-neutral-600" />
                </div>
                <h2 className="font-semibold text-neutral-900 mb-1">Самоанализ</h2>
                <p className="text-sm text-neutral-400">После выполнения заданий здесь появится анализ</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
