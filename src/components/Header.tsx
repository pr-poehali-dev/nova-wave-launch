import { Link } from "react-router-dom";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={`absolute top-0 left-0 right-0 z-10 p-6 ${className ?? ""}`}>
      <div className="flex justify-between items-center">
        <Link to="/" className="text-white text-sm uppercase tracking-wide font-bold">РусЯз</Link>
        <nav className="flex gap-8">
          <a
            href="#about"
            className="text-white hover:text-neutral-400 transition-colors duration-300 uppercase text-sm"
          >
            О платформе
          </a>
          <Link
            to="/login"
            className="text-white hover:text-neutral-400 transition-colors duration-300 uppercase text-sm"
          >
            Войти
          </Link>
        </nav>
      </div>
    </header>
  );
}
