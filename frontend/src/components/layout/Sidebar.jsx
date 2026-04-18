import { Link, NavLink } from "react-router-dom";
import {
  Bot,
  CalendarDays,
  Grid2x2,
  ImageIcon,
  Plus,
  Settings,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/avatar";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Grid2x2 },
  { name: "Content Generator", path: "/content-generator", icon: Sparkles },
  { name: "Image Generator", path: "/image-generator", icon: ImageIcon },
  { name: "Scheduler", path: "/scheduler", icon: CalendarDays },
  { name: "Chatbot", path: "/chatbot", icon: Bot }
];

function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="studio-sidebar flex h-full flex-col border-r border-gray-200 bg-white px-5 py-6 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto studio-scrollbar">
      <div className="mb-8 flex items-center gap-3 px-1 py-1">
        <img
          src="/logo.png"
          alt="Ether Logo"
          className="h-14 w-14 object-contain transition-transform duration-200 hover:scale-105 [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.2))] dark:[filter:none]"
        />
        <div className="flex flex-col leading-tight">
          <p className="text-base font-semibold text-gray-900 dark:text-white">Ether Studio</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">AI Content Engine</p>
        </div>
      </div>

      <Link
        to="/create-post"
        className="mb-8 flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6e3df5] to-[#9e79ff] text-sm font-semibold text-white shadow-glow"
      >
        <Plus size={16} />
        Create New Post
      </Link>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-r-full px-3 py-2.5 text-sm ${
                  isActive
                    ? "bg-gray-100 font-semibold text-studio-primary shadow-soft dark:bg-gray-800"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} />
                    {item.name}
                  </span>
                  <span className={isActive ? "h-7 w-0.5 rounded bg-studio-primary" : ""} />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <Link
          to="/profile"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Settings size={16} />
          Profile Settings
        </Link>
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#5e2de5] to-[#9a79ff] text-sm font-semibold text-white">
              {getInitials(user?.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user?.name || "Studio User"}</p>
            <p className="truncate text-sm text-gray-500 dark:text-gray-300">{user?.email || "Signed in"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
