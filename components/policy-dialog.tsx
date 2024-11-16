import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PolicyDialogProps {
  title: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export function PolicyDialog({ title, children, trigger }: PolicyDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(80vh-100px)] pr-4">
          <div className="space-y-6">
            {children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
