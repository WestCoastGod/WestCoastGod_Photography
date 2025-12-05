import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";

const Layout = () => {
  const location = useLocation();
  const hideSidebar = location.pathname === "/";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar: 大螢幕顯示，小螢幕根據 sidebarOpen 顯示 */}
      {!hideSidebar && (
        <>
          {/* 遮罩，sidebarOpen 時淡入淡出 */}
          <div
            className={`
              fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden
              transition-opacity duration-300
              ${
                sidebarOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }
            `}
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar: 小螢幕 sidebarOpen 時滑入滑出，大螢幕永遠顯示 */}
          <div
            className={`
              fixed z-[500] top-0 left-0 h-full
              transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0 lg:fixed lg:z-50 lg:top-0 lg:left-0 lg:h-full lg:block
            `}
            style={{ width: "12rem" }} // w-48
          >
            <Sidebar />
          </div>
        </>
      )}
      <main
        className={`${!hideSidebar ? "flex-1 p-8 lg:ml-48" : "flex-1 p-8"}`}
      >
        {/* 小螢幕顯示 Sidebar 開關按鈕 */}
        {!hideSidebar && (
          <button
            className="lg:hidden fixed top-4 left-4 z-[500] bg-white dark:bg-black rounded"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
                className="stroke-black dark:stroke-white"
              />
            </svg>
          </button>
        )}
        <Outlet />
      </main>
      <Analytics />
    </div>
  );
};

export default Layout;
