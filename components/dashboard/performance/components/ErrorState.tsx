import { AlertCircle } from "lucide-react"

interface ErrorStateProps {
  error: string | Error
}

export function ErrorState({ error }: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-red-500">Error Loading Performance Data</h3>
          <p className="text-sm text-muted-foreground max-w-md">{errorMessage}</p>
          <p className="text-sm text-muted-foreground max-w-md">Have you taken any challenges yet? Your performance data will appear here after completing challenges.</p>
        </div>
      </div>
    </div>
  )
}
