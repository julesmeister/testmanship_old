'use client';

import React from "react";
import Link from "next/link";

export default function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update URL without page reload
      window.history.pushState({}, '', `#${id}`);
    }
  };

  return (
    <div className="z-[3] flex flex-col items-center justify-between mt-auto pb-[30px] md:px-0 lg:flex-row">
      <ul className="flex flex-row">
        <li className="mr-4 md:mr-[44px]">
          <button
            onClick={() => scrollToSection('terms')}
            className="text-[10px] font-medium text-zinc-950 dark:text-zinc-400 lg:text-sm hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Terms & Conditions
          </button>
          <Link href="#terms" className="hidden">Terms & Conditions</Link>
        </li>
        <li className="mr-4 md:mr-[44px]">
          <button
            onClick={() => scrollToSection('privacy')}
            className="text-[10px] font-medium text-zinc-950 dark:text-zinc-400 lg:text-sm hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Privacy Policy
          </button>
          <Link href="#privacy" className="hidden">Privacy Policy</Link>
        </li>
        <li className="mr-4 md:mr-[44px]">
          <button
            onClick={() => scrollToSection('license')}
            className="text-[10px] font-medium text-zinc-950 dark:text-zinc-400 lg:text-sm hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            License
          </button>
          <Link href="#license" className="hidden">License Agreement</Link>
        </li>
        <li>
          <button
            onClick={() => scrollToSection('refund')}
            className="text-[10px] font-medium text-zinc-950 dark:text-zinc-400 lg:text-sm hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            Refund Policy
          </button>
          <Link href="#refund" className="hidden">Refund Policy</Link>
        </li>
      </ul>
    </div>
  );
}
