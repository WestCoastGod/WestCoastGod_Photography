import { Link } from "react-router-dom";
import Yeti from "./Yeti";

const Sidebar = () => {
  return (
    <div className="w-48 bg-white dark:bg-black shadow-none fixed h-full flex flex-col items-start p-10 z-[2000]">
      {/* 头像链接 */}
      <Link to="/welcome" className="block mb-4">
        <img
          src="/images/Profile%20Photo.JPG"
          className="w-24 h-24 rounded-full mx-auto hover:opacity-80 transition-opacity profile-photo"
          alt="My Profile Photo"
        />
      </Link>

      {/* 导航菜单 */}
      <nav className="space-y-4 w-full">
        <Link
          to="/about"
          className="items-center text-gray-700 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
          <nav className="w-5 h-5" /> About Me
        </Link>
        <Link
          to="/photography"
          className="items-cente text-gray-700 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
          <nav className="w-5 h-5" /> Photography
        </Link>
        <Link
          to="/hk-stargazing"
          className="items-cente text-gray-700 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
          <nav className="w-5 h-5" /> HK Stargazing
        </Link>
        <Link
          to="/music-to-image"
          className="items-cente text-gray-700 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
          <nav className="w-5 h-5" /> Music to Image
        </Link>
      </nav>

      {/* 社交图标（水平排列，與 Contact 間距一致） */}
      <div className="flex flex-row gap-2 mt-6">
        <a
          href="https://github.com/WestCoastGod"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group"
        >
          <img
            src="/images/github.svg"
            alt="GitHub"
            className="w-6 h-6 hover:opacity-70 invert-on-hover dark:invert"
          />
          {/* Custom tooltip */}
          <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            GitHub
          </span>
        </a>

        <a
          href="https://www.instagram.com/tri_arc_417/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group"
        >
          <img
            src="/images/instagram.svg"
            alt="Instagram"
            className="w-6 h-6 hover:opacity-70 invert-on-hover dark:invert"
          />
          <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Instagram
          </span>
        </a>

        <a
          href="https://www.linkedin.com/in/oscar-z-cw337/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group"
        >
          <img
            src="/images/linkedin.svg"
            alt="LinkedIn"
            className="w-6 h-6 hover:opacity-70 invert-on-hover dark:invert"
          />
          <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            LinkedIn
          </span>
        </a>

        <a
          href="mailto:zx.oscar.cx@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group"
        >
          <img
            src="/images/email.svg"
            alt="Email"
            className="w-6 h-6 hover:opacity-70 invert-on-hover dark:invert"
          />
          <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Email
          </span>
        </a>
      </div>

      {/* Yeti animation at the bottom */}
      <div className="mt-auto w-full flex justify-center items-end">
        <Yeti />
      </div>
    </div>
  );
};

export default Sidebar;
