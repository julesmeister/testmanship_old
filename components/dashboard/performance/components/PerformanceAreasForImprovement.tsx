import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ArrowUpCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface PerformanceAnalysisProps {
  weakest_skills: string[]
}

export function PerformanceAnalysis({ 
  weakest_skills = [], 
}: PerformanceAnalysisProps) {
  const itemsPerPage = 6
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(weakest_skills.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSkills = weakest_skills.slice(startIndex, endIndex)

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-rose-500/10">
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </div>
          <CardTitle className="text-foreground">Areas for Improvement</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {currentSkills.map((skill, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100"
              >
                <ArrowUpCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <span className="text-sm">{skill}</span>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
