'use client';

import React from "react";
import Link from "next/link";

export default function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState({}, '', `#${id}`);
    }
  };

  return (
    <div className="z-[3] flex w-full justify-center pb-[30px] px-4 md:px-0">
      <ul className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-[44px]">
        <li>
          <button
            onClick={() => scrollToSection('terms')}
            className="text-sm font-medium text-zinc-950 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Terms & Conditions
          </button>
          <Link href="#terms" className="hidden">Terms & Conditions</Link>
        </li>
        <li>
          <button
            onClick={() => scrollToSection('privacy')}
            className="text-sm font-medium text-zinc-950 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Privacy Policy
          </button>
          <Link href="#privacy" className="hidden">Privacy Policy</Link>
        </li>
        <li>
          <button
            onClick={() => scrollToSection('license')}
            className="text-sm font-medium text-zinc-950 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            License
          </button>
          <Link href="#license" className="hidden">License Agreement</Link>
        </li>
        <li>
          <button
            onClick={() => scrollToSection('refund')}
            className="text-sm font-medium text-zinc-950 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Refund Policy
          </button>
          <Link href="#refund" className="hidden">Refund Policy</Link>
        </li>
      </ul>
    </div>
  );
}
