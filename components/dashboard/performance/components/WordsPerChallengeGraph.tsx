'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PencilLine, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from 'next-themes';

interface WordsPerChallengeProps {
  data: Array<{
    challenge_number: string;
    words_written: number;
  }>;
}

export default function WordsPerChallengeGraph({ data }: WordsPerChallengeProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--foreground))';

  const labelStyle = {
    fill: axisColor,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const
  };

  return (
    <Card>
      <CardHeader className="border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <PencilLine className="h-4 w-4 text-green-500" />
            </div>
            <CardTitle className="text-foreground">Words Written Over Time</CardTitle>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ChevronDown 
              className={cn(
                "h-5 w-5 text-zinc-500 transition-transform duration-200",
                isCollapsed && "transform rotate-180"
              )} 
            />
          </button>
        </div>
      </CardHeader>
      <div className={cn(
        "transition-all duration-200 ease-in-out",
        isCollapsed ? "h-0 overflow-hidden" : "h-auto"
      )}>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 25,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="challenge_number" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fill: axisColor, fontSize: 12 }}
                  label={{ 
                    value: '📅 Challenge Date', 
                    position: 'insideBottom', 
                    offset: -15,
                    ...labelStyle
                  }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  label={{ 
                    value: '✍️ Words Written', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -5,
                    ...labelStyle
                  }}
                  tick={{ fill: axisColor, fontSize: 12 }}
                  stroke="hsl(var(--border))"
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: 'none',
                    borderRadius: '12px 12px 12px 0',
                    boxShadow: '0 4px 20px -5px rgb(0 0 0 / 0.2)',
                    padding: '0',
                    minWidth: '220px',
                    margin: '0',
                    lineHeight: '1'
                  }}
                  itemStyle={{ 
                    color: '#22c55e',
                    padding: '0',
                    margin: '0',
                    lineHeight: '1'
                  }}
                  formatter={(value: number) => [
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '15px 12px',
                      borderLeft: '3px solid #22c55e',
                      backgroundColor: 'rgba(34, 197, 94, 0.05)',
                      margin: '0',
                      lineHeight: '1'
                    }}>
                      <span style={{ 
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#18181b',
                        lineHeight: '1'
                      }}>
                        {value.toLocaleString()} words
                      </span>
                      <span style={{ 
                        color: '#71717a',
                        fontSize: '0.875rem',
                        lineHeight: '1'
                      }}>
                        ✍️ Words Written
                      </span>
                    </div>
                  ]}
                  labelFormatter={(label) => (
                    <div style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #f4f4f5',
                      margin: '0',
                      lineHeight: '1'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#18181b',
                        fontWeight: '600',
                        margin: '0',
                        lineHeight: '1'
                      }}>
                        <span style={{ fontSize: '1rem', lineHeight: '1' }}>📅</span>
                        Challenge {label}
                      </div>
                    </div>
                  )}
                  wrapperStyle={{ outline: 'none', margin: '0', padding: '0' }}
                />
                <Line
                  type="monotone"
                  dataKey="words_written"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", r: 4 }}
                  activeDot={{ r: 6, fill: "#22c55e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
