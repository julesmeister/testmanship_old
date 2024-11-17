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
      <ul className="flex flex-wrap justify-center gap-y-3 gap-x-4 md:flex-row md:gap-x-[44px]">
        <li>
          <button
            onClick={() => scrollToSection('terms')}
            className="text-[11px] font-medium text-zinc-950 dark:text-zinc-400 md:text-[12px] lg:text-sm hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Terms & Conditions
          </button>
          <Link href="#terms" className="hidden">Terms & Conditions</Link>
        </li>
        <li>
          <button
            onClick={() => scrollToSection('privacy')}
            className="text-[11px] font-medium text-zinc-950 dark:text-zinc-400 md:text-[12px] lg:text-sm hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Privacy Policy
          </button>
          <Link href="#privacy" className="hidden">Privacy Policy</Link>
        </li>
        <li>
          <button
            onClick={() => scrollToSection('license')}
            className="text-[11px] font-medium text-zinc-950 dark:text-zinc-400 md:text-[12px] lg:text-sm hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            License
          </button>
          <Link href="#license" className="hidden">License Agreement</Link>
        </li>
        <li>
          <button
            onClick={() => scrollToSection('refund')}
            className="text-[11px] font-medium text-zinc-950 dark:text-zinc-400 md:text-[12px] lg:text-sm hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Refund Policy
          </button>
          <Link href="#refund" className="hidden">Refund Policy</Link>
        </li>
      </ul>
    </div>
  );
}
