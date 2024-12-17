import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Check, Linkedin } from "lucide-react";
import { LightBulbIcon } from "./Icons";
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

const login = () => {
  redirect("/login")
}

export const HeroCards = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Are you up for it?';

  useEffect(() => {
    let index = 0;
    const typeWriter = setInterval(() => {
      console.log(`Index: ${index}, Character: ${fullText.charAt(index)}`); // Debugging log
      if (index < fullText.length) {
        setDisplayText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(typeWriter);
      }
    }, 100);

    return () => clearInterval(typeWriter);
  }, []);

  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
      {/* Testimonial */}
      <Card className="absolute w-[340px] -top-[15px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="flex flex-row items-center gap-4 pb-7">
          <Avatar>
            <AvatarImage
              alt=""
              src="https://github.com/shadcn.png"
            />
            <AvatarFallback>SH</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle className="text-lg">Writing Challenges</CardTitle>
            <CardDescription>{displayText}</CardDescription>
          </div>
        </CardHeader>

      </Card>

      {/* Team */}
      <Card className="absolute right-[20px] top-4 w-80 flex flex-col justify-center items-center drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <div
          className="relative overflow-hidden rounded-lg bg-gradient-to-br from-violet-200 to-pink-100 p-4 shadow-sm w-full transition-transform duration-300 ease-in-out hover:scale-105"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-violet-600">Difficulty Level</p>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level, index) => (
                <button
                  key={level}
                  className={cn(
                    "px-2 py-1.5 rounded text-xs font-medium transition-all",
                    "hover:bg-violet-200/50 relative overflow-hidden group",
                    index % 2 === 0 ? "bg-violet-300 text-violet-700" : "bg-pink-300 text-pink-700"
                  )}
                >
                  <span className="relative">
                    {level}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing */}
      <Card className="absolute top-[110px] left-[50px] w-72 drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader>
          <CardTitle className="flex item-center justify-between">
            Language Proficiency Booster
            
          </CardTitle>
          <div>
            <span className="text-3xl font-bold">Unlock Your Potential</span><br></br>
            <span className="text-muted-foreground"> with our resources</span>
          </div>

          <CardDescription>
            Our program enhances your language skills, helping you excel in proficiency exams through targeted practice and engaging materials.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button className="w-full bg-orange-500 hover:bg-orange-700 text-white">Start Your Journey</Button>
        </CardContent>

        <hr className="w-4/5 m-auto mb-4" />

        <CardFooter className="flex">
          <div className="space-y-4">
            {[
              "Practice Materials",
              "Expert Tips",
              "Flexible Learning"
            ].map(
              (benefit: string) => (
                <span
                  key={benefit}
                  className="flex"
                >
                  <Check className="text-green-500" />{" "}
                  <h3 className="ml-2">{benefit}</h3>
                </span>
              )
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Service */}
      <Card className="absolute top-[160px] w-[350px] -right-[10px] bottom-[155px]  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
          <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
            <LightBulbIcon />
          </div>
          <div>
            <CardTitle>Not Challenged Enough?</CardTitle>
            <CardDescription className="text-md mt-2">
              You can ask AI to test you with more topics for you to write about.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
