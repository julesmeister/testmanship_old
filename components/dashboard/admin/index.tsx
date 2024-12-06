"use client";

import { useState } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardLayout from '@/components/layout';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ExerciseManagement from './exercise-management';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}

const ADMIN_SECTIONS = [
  { id: 'challenges', name: 'Challenges' },
  { id: 'exercises', name: 'Exercises' },
] as const;

type AdminSection = typeof ADMIN_SECTIONS[number]['id'];

export default function AdminSettings({ user, userDetails }: Props) {
  const supabase = createClientComponentClient();
  const [selectedSection, setSelectedSection] = useState<AdminSection>('exercises');

  return (
    <DashboardLayout
      user={user}
      userDetails={userDetails}
      title='Admin Settings'
      description='Manage your application settings and configurations'
    >
      <div className="container mx-auto py-6 space-y-6">
        {/* Section Selection */}
        <div className="flex flex-wrap gap-3 p-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
          {ADMIN_SECTIONS.map((section, index) => (
            <motion.button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200",
                "rounded-lg backdrop-blur-sm",
                selectedSection === section.id
                  ? "bg-white text-violet-600 shadow-lg shadow-violet-100/50 ring-1 ring-violet-100"
                  : "text-gray-600 hover:text-violet-600 hover:bg-white/80 hover:ring-1 hover:ring-violet-100/50"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-lg opacity-50",
                  selectedSection === section.id && "bg-gradient-to-r from-violet-50/50 to-violet-100/30"
                )}
                layoutId="activeAdminSection"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
              {selectedSection === section.id && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-violet-50/30 rounded-lg animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/10 to-transparent rounded-lg animate-shimmer" 
                       style={{ backgroundSize: '200% 100%' }} />
                </motion.div>
              )}
              <span className="relative">
                {section.name}
              </span>
              {selectedSection === section.id && (
                <motion.div
                  className="absolute -right-1 -top-1 flex items-center justify-center w-4 h-4 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full ring-2 ring-white"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    boxShadow: [
                      "0 0 0 0 rgba(139, 92, 246, 0)",
                      "0 0 0 4px rgba(139, 92, 246, 0.3)",
                      "0 0 0 0 rgba(139, 92, 246, 0)"
                    ]
                  }}
                  transition={{ 
                    scale: { type: "spring", stiffness: 400, damping: 15 },
                    boxShadow: { duration: 1.5, repeat: Infinity }
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={selectedSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {selectedSection === 'exercises' ? (
            <ExerciseManagement supabase={supabase} />
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Challenge Management</h2>
              <p className="text-gray-500 mt-2">Challenge configuration and settings coming soon...</p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
