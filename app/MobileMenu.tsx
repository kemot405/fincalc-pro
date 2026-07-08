"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type MenuItem = {
  label: string;
  href: string;
};

export default function MobileMenu({ menuItems }: { menuItems: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: PointerEvent) {
      const target = event.target as Node;

      const clickedInsideMenu = menuRef.current?.contains(target);
      const clickedButton = buttonRef.current?.contains(target);

      if (!clickedInsideMenu && !clickedButton) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-lg border border-green-400/40 bg-gray-700 px-3 py-2 text-lg font-bold text-white transition hover:bg-gray-600"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        aria-expanded={open}
      >
        ☰
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-3 w-64 rounded-2xl border border-green-300/40 bg-[#21130d] p-3 shadow-2xl"
        >
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-[#cfe8c9] transition hover:bg-green-900/40"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="#login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-900/40"
            >
              Zaloguj się
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
