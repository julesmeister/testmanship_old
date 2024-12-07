"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchingProps } from '@/types/exercises';

export default function Matching({ exercise, onComplete }: MatchingProps) {
  const [leftItems] = useState(exercise.pairs.map(p => p.left));
  const [rightItems, setRightItems] = useState(() => {
    // Shuffle right items
    return exercise.pairs
      .map(p => p.right)
      .sort(() => Math.random() - 0.5);
  });
  const [matches, setMatches] = useState<number[]>(() => new Array(leftItems.length).fill(-1));
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [leftRefs] = useState<(HTMLDivElement | null)[]>([]);
  const [rightRefs] = useState<(HTMLDivElement | null)[]>([]);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Predefined colors for matching pairs
  const pairColors = [
    "rgb(244 114 182)", // pink-400
    "rgb(168 85 247)",  // purple-500
    "rgb(34 211 238)",  // cyan-400
    "rgb(74 222 128)",  // green-400
    "rgb(251 146 60)",  // orange-400
    "rgb(139 92 246)",  // violet-400
    "rgb(45 212 191)",  // teal-400
    "rgb(248 113 113)", // red-400
    "rgb(147 51 234)",  // purple-600
    "rgb(59 130 246)",  // blue-500
  ];

  const getItemColor = (index: number, isRight: boolean) => {
    if (selectedLeft === index && !isRight) {
      return "rgb(99 102 241)"; // indigo-500 for selected
    }
    
    if (isRight) {
      // For right items, find if this item is matched
      const leftIndex = matches.findIndex(m => m === index);
      if (leftIndex !== -1) {
        return pairColors[leftIndex % pairColors.length];
      }
    } else {
      // For left items, check if it has a match
      if (matches[index] !== -1) {
        return pairColors[index % pairColors.length];
      }
    }
    
    return "rgb(255 255 255)"; // white for unmatched
  };

  const getItemStyles = (index: number, isRight: boolean) => {
    const baseStyles = "p-4 rounded-xl shadow-lg transition-all duration-200 cursor-pointer border-2";
    const color = getItemColor(index, isRight);
    const isMatched = isRight ? matches.includes(index) : matches[index] !== -1;
    const isSelected = !isRight && selectedLeft === index;
    
    return `${baseStyles} ${
      isMatched 
        ? `bg-${color} border-transparent text-white transform hover:-translate-y-1`
        : isSelected
          ? "bg-indigo-500 border-transparent text-white transform hover:-translate-y-1"
          : "bg-white border-gray-200 hover:border-indigo-500 hover:shadow-xl"
    }`;
  };

  // Update SVG dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setSvgDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [matches]); // Re-run when matches change

  const getConnectionLine = (leftIndex: number, rightIndex: number) => {
    const leftEl = leftRefs[leftIndex];
    const rightEl = rightRefs[rightIndex];
    
    if (!leftEl || !rightEl) return null;

    const leftRect = leftEl.getBoundingClientRect();
    const rightRect = rightEl.getBoundingClientRect();
    const containerRect = leftEl.parentElement?.parentElement?.getBoundingClientRect();

    if (!containerRect) return null;

    const x1 = leftRect.right - containerRect.left;
    const y1 = leftRect.top - containerRect.top + leftRect.height / 2;
    const x2 = rightRect.left - containerRect.left;
    const y2 = rightRect.top - containerRect.top + rightRect.height / 2;

    // Calculate control points for the curve
    const dx = x2 - x1;
    const dy = y2 - y1;
    const controlX = x1 + dx * 0.5;

    const color = showResults 
      ? exercise.pairs[leftIndex].right === rightItems[rightIndex]
        ? "rgb(34 197 94)" // green-500
        : "rgb(239 68 68)" // red-500
      : pairColors[leftIndex % pairColors.length];
    
    return {
      path: `
        M ${x1} ${y1}
        C ${controlX} ${y1},
          ${controlX} ${y2},
          ${x2} ${y2}
      `,
      color,
      x1,
      y1,
      x2,
      y2
    };
  };

  const handleMatch = (rightIndex: number) => {
    if (selectedLeft === null) return;

    const newMatches = [...matches];
    // Remove any existing matches for these items
    const leftMatch = matches.findIndex(m => m === rightIndex);
    if (leftMatch !== -1) {
      newMatches[leftMatch] = -1;
    }
    newMatches[selectedLeft] = rightIndex;
    setMatches(newMatches);
    setSelectedLeft(null);
  };

  const handleUnmatch = (index: number, isRight: boolean) => {
    if (showResults) return;
    
    if (isRight) {
      const leftIndex = matches.findIndex(m => m === index);
      if (leftIndex !== -1) {
        const newMatches = [...matches];
        newMatches[leftIndex] = -1;
        setMatches(newMatches);
      }
    } else {
      if (matches[index] !== -1) {
        const newMatches = [...matches];
        newMatches[index] = -1;
        setMatches(newMatches);
      }
    }
    setSelectedLeft(null);
  };

  const handleLeftClick = (index: number) => {
    if (showResults) return;
    
    if (selectedLeft === index) {
      // Deselect if clicking the same item
      setSelectedLeft(null);
    } else if (matches[index] !== -1) {
      // Unplug if already matched
      handleUnmatch(index, false);
    } else {
      // Select new item
      setSelectedLeft(index);
    }
  };

  const handleRightClick = (index: number) => {
    if (showResults) return;
    
    if (matches.includes(index)) {
      handleUnmatch(index, true);
    } else if (selectedLeft !== null) {
      handleMatch(index);
    }
  };

  const checkAnswers = () => {
    setShowResults(true);
    const correctMatches = matches.reduce((count, rightIndex, leftIndex) => {
      return exercise.pairs[leftIndex].right === rightItems[rightIndex] ? count + 1 : count;
    }, 0);
    const score = Math.round((correctMatches / exercise.pairs.length) * 100);
    onComplete(score, exercise.pairs.length);
  };

  useEffect(() => {
    // When all pairs are matched, automatically check answers
    if (!showResults && matches.filter(m => m !== -1).length === exercise.pairs.length) {
      checkAnswers();
    }
  }, [matches, showResults]);

  return (
    <div className="p-6 space-y-6">
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8" ref={containerRef}>
        <svg 
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
          width={svgDimensions.width}
          height={svgDimensions.height}
          viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
        >
          {matches.map((rightIndex, leftIndex) => {
            if (rightIndex === -1 || rightIndex === undefined) return null;
            const line = getConnectionLine(leftIndex, rightIndex);
            if (!line) return null;

            return (
              <g key={`${leftIndex}-${rightIndex}`}>
                {/* Wire path */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  d={line.path}
                  stroke={line.color}
                  strokeWidth="2"
                  strokeDasharray="4"
                  fill="none"
                />
                {/* Left plug */}
                <motion.g
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <circle
                    cx={line.x1}
                    cy={line.y1}
                    r="6"
                    fill={line.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle
                    cx={line.x1}
                    cy={line.y1}
                    r="3"
                    fill="white"
                  />
                </motion.g>
                {/* Right plug */}
                <motion.g
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <circle
                    cx={line.x2}
                    cy={line.y2}
                    r="6"
                    fill={line.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle
                    cx={line.x2}
                    cy={line.y2}
                    r="3"
                    fill="white"
                  />
                </motion.g>
              </g>
            );
          })}
        </svg>

        {/* Left Column */}
        <div className="space-y-4">
          {leftItems.map((item, index) => (
            <motion.div
              key={index}
              ref={el => leftRefs[index] = el}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLeftClick(index)}
              className={getItemStyles(index, false)}
              style={{
                backgroundColor: getItemColor(index, false),
                color: matches[index] !== -1 ? "white" : "black",
                cursor: showResults ? "default" : "pointer",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{item}</span>
                {matches[index] !== -1 && (
                  <div className="w-2 h-2 rounded-full bg-white opacity-75" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {rightItems.map((item, index) => (
            <motion.div
              key={index}
              ref={el => rightRefs[index] = el}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRightClick(index)}
              className={getItemStyles(index, true)}
              style={{
                backgroundColor: getItemColor(index, true),
                color: matches.includes(index) ? "white" : "black",
                cursor: showResults ? "default" : "pointer",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{item}</span>
                {matches.includes(index) && (
                  <div className="w-2 h-2 rounded-full bg-white opacity-75" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Correct Pairs
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    Score:
                  </span>
                  <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium rounded-full">
                    {matches.reduce((count, rightIndex, leftIndex) => {
                      return exercise.pairs[leftIndex].right === rightItems[rightIndex] ? count + 1 : count;
                    }, 0)} / {exercise.pairs.length}
                  </span>
                </div>
              </div>
              
              <div className="grid gap-4">
                {exercise.pairs.map((pair, index) => {
                  const isCorrect = matches[index] !== -1 && rightItems[matches[index]] === pair.right;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl transition-colors",
                        isCorrect
                          ? "bg-green-50 dark:bg-green-900/20"
                          : "bg-red-50 dark:bg-red-900/20"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-medium truncate">
                            {pair.left}
                          </span>
                          <ArrowRight className={cn(
                            "w-5 h-5",
                            isCorrect
                              ? "text-green-500 dark:text-green-400"
                              : "text-red-500 dark:text-red-400"
                          )} />
                          <span className="text-base font-medium truncate">
                            {pair.right}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-500 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <X className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
