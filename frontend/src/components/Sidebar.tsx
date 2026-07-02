import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "dashboard" },
  { label: "ADRs", path: "/adrs", icon: "list_alt" },
  { label: "Create ADR", path: "/adrs/create", icon: "add_circle" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.email?.[0]?.toUpperCase() ?? "?";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      style={{ width: DRAWER_WIDTH }}
      className="shrink-0 h-screen sticky top-0 flex flex-col border-r border-gray-200 bg-white"
    >
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold">ADR Platform</h1>
      </div>

      <nav className="flex-1 py-2">
        {NAV_ITEMS.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left ${
                selected
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="material-icons text-xl leading-none">
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {user && (
        <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-200">
          <div className="h-8 w-8 shrink-0 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-medium">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{user.email}</p>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[11px] capitalize ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {user.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
          >
            <span className="material-icons text-xl leading-none">
              logout
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}
