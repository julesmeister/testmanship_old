import { useState } from 'react';

interface TextStats {
  wordCount: number;
  paragraphCount: number;
  charCount: number;
}

export const useTextEditor = (initialText: string = '') => {
  const [inputMessage, setInputMessage] = useState<string>(initialText);
  const [wordCount, setWordCount] = useState<number>(0);
  const [paragraphCount, setParagraphCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [prevText, setPrevText] = useState<string>(initialText);
  const [lastEditedParagraphIndex, setLastEditedParagraphIndex] = useState<number>(-1);

  const handleTextChange = (text: string) => {
    setInputMessage(text);
    setWordCount(text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(word => word.length > 0).length);
    setParagraphCount(text.trim() === '' ? 0 : text.trim().split(/\n\s*\n/).filter(para => para.trim().length > 0).length);
    setCharCount(text.length);
    setPrevText(text);
  };

  return {
    text: inputMessage,
    prevText,
    stats: { wordCount, paragraphCount, charCount },
    lastEditedParagraphIndex,
    handleTextChange,
    setLastEditedParagraphIndex,
    setInputMessage
  };
};
