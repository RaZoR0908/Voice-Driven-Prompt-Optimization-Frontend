import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/history", label: "History" },
  { to: "/memory", label: "Memory" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-pink/20 bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div className="font-mono text-lg font-bold tracking-wider text-pink">
          VOICE//ENGINE
        </div>

        <div className="flex items-center gap-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `font-mono text-sm transition-colors ${
                  isActive
                    ? "border-b border-pink pb-1 text-pink"
                    : "pb-1 text-muted hover:text-pink-light"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
