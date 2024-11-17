'use client';
/*eslint-disable*/

import MessageBoxChat from '@/components/MessageBoxChat';
import DashboardLayout from '@/components/layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Bgdark from '@/public/img/dark/test/bg-image.png';
import Bg from '@/public/img/light/test/bg-image.png';
import { ChatBody, OpenAIModel } from '@/types/types';
import { User } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import { HiUser, HiSparkles, HiMiniPencilSquare } from 'react-icons/hi2';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}
export default function Test({ user, userDetails }: Props) {
  const { theme, setTheme } = useTheme();
  // *** If you use .env.local variable for your API key, method which we recommend, use the apiKey variable commented below
  // Input States
  const [inputOnSubmit, setInputOnSubmit] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  // Response message
  const [outputCode, setOutputCode] = useState<string>('');
  // ChatGPT model
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [paragraphCount, setParagraphCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isWriting, setIsWriting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [hasStartedWriting, setHasStartedWriting] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputMessage(text);
    
    // Start timer if this is the first keystroke
    if (!isWriting && text.length > 0) {
      setIsWriting(true);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const start = startTimeRef.current || now;
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    }
    
    // Stop timer if text is cleared
    if (isWriting && text.length === 0) {
      setIsWriting(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setElapsedTime(0);
    }

    // Update counts
    setWordCount(text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(word => word.length > 0).length);
    setParagraphCount(text.trim() === '' ? 0 : text.trim().split(/\n\s*\n/).filter(para => para.trim().length > 0).length);
    setCharCount(text.length);
    if (!hasStartedWriting && text.length > 0) {
      setHasStartedWriting(true);
    }
  };

  // API Key
  const handleTranslate = async () => {
    setInputOnSubmit(inputMessage);

    // Chat post conditions(maximum number of characters, valid message etc.)
    const maxCodeLength = model === 'gpt-3.5-turbo' ? 700 : 700;

    if (!inputMessage) {
      alert('Please enter your subject.');
      return;
    }

    if (inputMessage.length > maxCodeLength) {
      alert(
        `Please enter code less than ${maxCodeLength} characters. You are currently at ${inputMessage.length} characters.`
      );
      return;
    }
    setOutputCode(' ');
    setLoading(true);
    const controller = new AbortController();
    const body: ChatBody = {
      inputMessage,
      model
    };

    // -------------- Fetch --------------
    const response = await fetch('/api/chatAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      setLoading(false);
      if (response) {
        alert(
          'Something went wrong went fetching from the API. Make sure to use a valid API key.'
        );
      }
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Something went wrong');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      setLoading(true);
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
  };
  // -------------- Copy Response --------------
  // const copyToClipboard = (text: string) => {
  //  const el = document.createElement('textarea');
  //  el.value = text;
  //  document.body.appendChild(el);
  //  el.select();
  //  document.execCommand('copy');
  //  document.body.removeChild(el);
  // };

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title="Writing Assistant"
      description="Get instant feedback on your writing"
    >
      <div className="flex w-full gap-6 h-[calc(100vh-200px)]">
        {/* Left Column - Writing Area */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={inputMessage}
            onChange={handleTextChange}
            placeholder="Start writing your essay here..."
            className="w-full h-full p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
          />
          {/* Writing Statistics Bar */}
          <div className="mt-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">Words</p>
                    <div className="text-2xl font-bold text-foreground">{wordCount}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">Paragraphs</p>
                    <div className="text-2xl font-bold text-foreground">{paragraphCount}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">Characters</p>
                    <div className="text-2xl font-bold text-foreground">{charCount}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">Time Elapsed</p>
                    <div className="text-2xl font-bold text-foreground">{formatTime(elapsedTime)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/3 flex flex-col gap-4">
          {/* Challenge Selection */}
          <div className="space-y-4">
            <Tabs defaultValue="a1" className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="a1" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">A1</TabsTrigger>
                <TabsTrigger value="a2" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">A2</TabsTrigger>
                <TabsTrigger value="b1" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">B1</TabsTrigger>
                <TabsTrigger value="b2" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">B2</TabsTrigger>
                <TabsTrigger value="c1" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">C1</TabsTrigger>
                <TabsTrigger value="c2" className="data-[state=inactive]:text-gray-600 data-[state=inactive]:dark:text-gray-300">C2</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex gap-2">
                <Input
                  type="search"
                  placeholder="Search writing challenges..."
                  className="flex-1"
                />
                <Button variant="outline">Search</Button>
              </div>
            </div>
          </div>

          {/* Instructions & Criteria */}
          {selectedChallenge && (
            <Accordion type="single" collapsible className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <AccordionItem value="instructions">
                <AccordionTrigger className="px-4">Writing Instructions & Criteria</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Topic</h3>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Discuss the impact of artificial intelligence on modern education.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
                        <li>Minimum 500 words</li>
                        <li>Include at least 3 specific examples</li>
                        <li>Address both benefits and challenges</li>
                        <li>Conclude with your personal perspective</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* AI Feedback */}
          {selectedChallenge && hasStartedWriting && (
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 overflow-y-auto">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <HiSparkles className="w-5 h-5" />
                AI Feedback
              </h2>
              <div className="space-y-4">
                {outputCode ? (
                  <div className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                    {outputCode}
                  </div>
                ) : (
                  <div className="text-zinc-500 dark:text-zinc-400 italic">
                    Start writing to receive real-time feedback on your essay.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
