'use client';

import { Button } from '../ui/button';
import Footer from '@/components/footer/FooterAuthDefault';
import { useTheme } from 'next-themes';
import { PropsWithChildren } from 'react';
import { FaChevronLeft } from 'react-icons/fa6';
import { HiBolt } from 'react-icons/hi2';
import { IoMoon, IoSunny } from 'react-icons/io5';
import PolicySections  from '../auth/policy-sections';

interface DefaultAuthLayoutProps extends PropsWithChildren {
  children: JSX.Element;
  viewProp: any;
}

export default function DefaultAuthLayout(props: DefaultAuthLayoutProps) {
  const { children } = props;
  const { theme, setTheme } = useTheme();
  return (
    <div className="relative h-max dark:bg-zinc-950">
      <div className="relative flex min-h-screen">
        {/* Left column - constrained width */}
        <div className="flex w-full flex-col px-5 pt-0 md:max-w-[66%] lg:max-w-[50%] xl:max-w-[50%] 2xl:max-w-[56%]">
          {/* Back button with proper spacing */}
          <div className="mt-10 mb-6 px-4 lg:px-8">
            <a className="inline-flex items-center text-zinc-950 dark:text-white" href="/">
              <FaChevronLeft className="mr-3 h-[13px] w-[8px]" />
              <span className="text-sm">Back to the website</span>
            </a>
          </div>

          {/* Main content area */}
          <div className="flex flex-1 flex-col justify-center px-4 lg:px-8">
            {children}
          </div>
          <div className="flex w-full justify-center mt-8 md:mt-12">
            <Footer />
          </div>

        </div>

        {/* Right column - decorative background */}
        <div className="fixed right-0 hidden h-full min-h-screen xl:block xl:w-[50%] 2xl:w-[44%]">
          <div className="absolute flex h-full w-full flex-col items-end justify-start overflow-y-auto snap-y snap-mandatory">
            {/* Background with gradient and overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-900 dark:from-blue-600 dark:via-blue-800 dark:to-indigo-950">
              {/* Decorative shapes */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Large circle */}
                <div className="absolute -top-[30%] -right-[10%] h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-3xl" />
                {/* Small circle */}
                <div className="absolute top-[60%] -left-[10%] h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl" />
                {/* Additional shapes */}
                <div className="absolute top-[20%] right-[20%] h-32 w-32 rotate-45 transform bg-white/5 backdrop-blur-lg" />
                <div className="absolute bottom-[30%] left-[10%] h-24 w-24 rotate-12 transform bg-white/5 backdrop-blur-lg rounded-lg" />
                {/* Floating dots */}
                <div className="absolute top-[15%] left-[25%] h-2 w-2 rounded-full bg-white/40" />
                <div className="absolute top-[45%] right-[15%] h-3 w-3 rounded-full bg-white/30" />
                <div className="absolute bottom-[25%] right-[35%] h-2 w-2 rounded-full bg-white/40" />
              </div>
            </div>
            
            {/* Content */}
            <div className="relative min-h-screen w-full flex flex-col items-center justify-center snap-start shrink-0">
              <div className="flex flex-col items-center justify-center">
                <div className="mb-12 flex items-center justify-center relative">
                  {/* Logo container with glass effect */}
                  <div className="me-2 flex h-[76px] w-[76px] items-center justify-center rounded-md bg-white/10 backdrop-blur-md border border-white/20">
                    <HiBolt className="h-9 w-9 text-white" />
                  </div>
                  <h5 className="text-4xl font-bold leading-5 text-white">
                    Testmanship
                  </h5>
                </div>
                <div className="flex flex-col items-center justify-center text-2xl font-bold text-white">
                  {/* Message container with glass effect */}
                  <h4 className="mb-5 flex w-[600px] items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm p-6 text-center text-2xl font-bold border border-white/10">
                    "Master language exams like IELTS, TELC, OSD, and HSK with Testmanship. Practice with real exam-style questions, get instant feedback, and track your progress to achieve your target score."
                  </h4>
                  <h5 className="text-xl font-medium leading-5 text-white/80">
                    Your path to exam success starts here!
                  </h5>
                </div>
              </div>
            </div>
            <PolicySections />
          </div>
        </div>
      </div>
     
      <Button
        className="absolute bottom-10 right-10 flex min-h-10 min-w-10 cursor-pointer rounded-full bg-zinc-950 p-0 text-xl text-white hover:bg-zinc-950 dark:bg-white dark:text-zinc-950 hover:dark:bg-white xl:bg-white xl:text-zinc-950 xl:hover:bg-white xl:dark:text-zinc-900"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'light' ? (
          <IoMoon className="h-4 w-4" />
        ) : (
          <IoSunny className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
