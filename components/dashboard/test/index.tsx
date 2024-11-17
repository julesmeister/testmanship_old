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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import RightColumn from './RightColumn';

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
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');

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

  const handleStartChallenge = (challenge: any) => {
    setSelectedChallenge(challenge);
    // Reset timer and counts
    setElapsedTime(0);
    setWordCount(0);
    setParagraphCount(0);
    setCharCount(0);
    setInputMessage('');
    setOutputCode('');
    
    // Start the timer
    setIsWriting(true);
    startTimeRef.current = Date.now();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const start = startTimeRef.current || now;
      setElapsedTime(Math.floor((now - start) / 1000));
    }, 1000);
  };

  const handleStopChallenge = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsWriting(false);
    startTimeRef.current = null;
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
          <Tabs defaultValue="practice" className="mb-4" onValueChange={(value) => setMode(value as 'practice' | 'exam')}>
            <TabsList className="grid w-full grid-cols-2 bg-indigo-50 dark:bg-indigo-950 p-1">
              <TabsTrigger 
                value="practice" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500 
                          data-[state=inactive]:text-indigo-600 dark:data-[state=inactive]:text-indigo-400
                          hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                Practice Mode
              </TabsTrigger>
              <TabsTrigger 
                value="exam" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500
                          data-[state=inactive]:text-indigo-600 dark:data-[state=inactive]:text-indigo-400
                          hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                Exam Mode
              </TabsTrigger>
            </TabsList>
          </Tabs>
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

        <RightColumn 
          selectedChallenge={selectedChallenge}
          hasStartedWriting={hasStartedWriting}
          outputCode={outputCode}
          onStartChallenge={handleStartChallenge}
          onStopChallenge={handleStopChallenge}
        />
      </div>
    </DashboardLayout>
  );
}
