import { PencilIcon, ClockIcon, CheckCircleIcon, ChatBubbleBottomCenterTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';

type EmptyTestStateProps = {
  mode: 'practice' | 'exam';
  setMode: (mode: 'practice' | 'exam') => void;
};

const EmptyTestState = ({ mode, setMode }: EmptyTestStateProps) => {
  return (
    <div className="flex-1 w-full h-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex flex-col items-center justify-center p-12 space-y-6">
      <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <PencilIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
      </div>
      <div className="space-y-4 text-center max-w-xl">
        <h3 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100">
          Ready to Start Writing?
        </h3>
        <p className="text-base text-zinc-500 dark:text-zinc-400">
          Select a challenge from the list to begin your writing journey. We'll track your progress and provide feedback along the way.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-8 border-t border-zinc-100 dark:border-zinc-800 pt-8">
          <div 
            onClick={() => setMode('practice')}
            className={`space-y-4 p-6 rounded-lg border ${mode === 'practice' ? 'border-indigo-500 dark:border-indigo-500' : 'border-zinc-200 dark:border-zinc-700'} hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors duration-200 cursor-pointer bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md`}
          >
            <div className="flex items-center space-x-3">
              <h4 className={`text-base font-medium ${mode === 'practice' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-900 dark:text-zinc-100'}`}>Practice Mode</h4>
              <svg className={`h-5 w-5 ${mode === 'practice' ? 'text-indigo-500' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-left">
              Get real-time AI assistance as you write. Receive sentence suggestions when idle and choose to receive feedback on select paragraph. Perfect for improving your writing skills with guidance.
            </p>
          </div>
          <div 
            onClick={() => setMode('exam')}
            className={`space-y-4 p-6 rounded-lg border ${mode === 'exam' ? 'border-indigo-500 dark:border-indigo-500' : 'border-zinc-200 dark:border-zinc-700'} hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors duration-200 cursor-pointer bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md`}
          >
            <div className="flex items-center space-x-3">
              <h4 className={`text-base font-medium ${mode === 'exam' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-900 dark:text-zinc-100'}`}>Exam Mode</h4>
              <svg className={`h-5 w-5 ${mode === 'exam' ? 'text-indigo-500' : 'text-zinc-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-left">
              Write independently without assistance. Get comprehensive evaluation upon completion, with detailed strengths and weaknesses analysis for your writing portfolio.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-zinc-400 dark:text-zinc-500 pt-4">
          <ClockIcon className="w-5 h-5" />
          <span>Timer starts when you select a challenge</span>
        </div>
      </div>
      <div className="flex items-center space-x-6 text-base text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          <span>Progress Tracking</span>
        </div>
        <div className="flex items-center">
          <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-2" />
          <span>Instant Feedback</span>
        </div>
        <div className="flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2" />
          <span>Performance Stats</span>
        </div>
      </div>
    </div>
  );
};

export default EmptyTestState;
