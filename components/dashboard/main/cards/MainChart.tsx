import { Card } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MdArrowUpward } from 'react-icons/md';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from 'react';

export default function MainChart() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("week");

  const writingMetrics = {
    paragraphsWritten: {
      value: 157,
      change: 23,
      period: "Last 7 days"
    },
    challengesTaken: {
      value: 42,
      change: 8,
      period: "Last 7 days"
    },
    daysStreak: {
      value: 15,
      change: 5,
      period: "Current streak"
    }
  };

  const data = [
    { name: 'Mon', paragraphs: 20 },
    { name: 'Tue', paragraphs: 15 },
    { name: 'Wed', paragraphs: 25 },
    { name: 'Thu', paragraphs: 30 },
    { name: 'Fri', paragraphs: 18 },
    { name: 'Sat', paragraphs: 28 },
    { name: 'Sun', paragraphs: 22 },
  ];

  return (
    <Card className="w-full h-full pb-12 p-[20px]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Writing Progress</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                {writingMetrics.paragraphsWritten.value}
              </span>
              <div className="flex items-center gap-1 px-2 py-1 text-sm text-green-500 bg-green-500/10 rounded-full">
                <MdArrowUpward className="h-4 w-4" />
                <span className="font-medium">+{writingMetrics.paragraphsWritten.change}%</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                paragraphs this {timeframe}
              </span>
            </div>
          </div>
          <Tabs defaultValue="week" value={timeframe} onValueChange={(value) => setTimeframe(value as "week" | "month" | "year")}>
            <TabsList className="bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="week" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">Week</TabsTrigger>
              <TabsTrigger value="month" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">Month</TabsTrigger>
              <TabsTrigger value="year" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="name"
                stroke="#A3AED0"
                fontSize={14}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#A3AED0"
                fontSize={14}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}p`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(24 24 27)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  padding: "8px 12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                }}
                labelStyle={{ color: "rgb(161 161 170)", marginBottom: "4px" }}
                itemStyle={{ color: "rgb(244 244 245)" }}
                cursor={{ fill: "rgb(94 55 255 / 0.08)" }}
              />
              <Bar 
                dataKey="paragraphs"
                fill="#5E37FF"
                radius={[10, 10, 0, 0]}
                barSize={40}
                activeBar={{ fill: "#7C5AFF" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Challenges Taken
              </p>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                {writingMetrics.challengesTaken.value}
              </span>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-500 bg-green-500/10 rounded-full">
                <MdArrowUpward className="h-3 w-3" />
                <span>+{writingMetrics.challengesTaken.change}</span>
              </div>
            </div>
            <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              vs previous {timeframe}
            </span>
          </div>
          
          <div className="flex flex-col p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Days Streak
              </p>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                {writingMetrics.daysStreak.value} days
              </span>
              
            </div>
            <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              current streak
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
