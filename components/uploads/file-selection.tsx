"use client"

import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { FileIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import React from "react"

type FileType = {
  id: string
  name: string
  type: string
  key: string
  size: number
}

// Define accepted file type prefixes for filtering (optional)
type AcceptedFileType =
  | "image/"
  | "video/"
  | "audio/"
  | "application/pdf"
  | "text/"
  | "all"

interface CompactFileSelectionProps {
  value: string[]
  onChange: (selected: string[]) => void
  className?: string
  fileType?: AcceptedFileType // e.g., "image/", "application/pdf"
}

export function CompactFileSelection({
  value,
  onChange,
  className,
  fileType = "all",
}: CompactFileSelectionProps) {
  const { data, isLoading, error } = useQuery<{ files: FileType[] }>(
    { queryKey: ["ai-builder-files"], 
      queryFn : async () => {
        // Build query param only if fileType is specified and not "all"
      const query = fileType !== "all" ? `?type=${encodeURIComponent(fileType)}` : ""
      const res = await fetch(`/api/upload${query}`)
      if (!res.ok) {
        throw new Error("Failed to fetch files")
      }
      return res.json()}
    } 
  )

  const handleFileClick = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <ScrollArea className="w-full whitespace-nowrap px-4">
        <div className="flex items-center gap-4 py-3">
          {isLoading && (
            <span className="text-muted-foreground text-sm">Loading files...</span>
          )}

          {error && (
            <span className="text-red-600 text-sm">Error loading files</span>
          )}

          {!isLoading && !error && data?.files.length === 0 && (
            <span className="text-muted-foreground text-sm">No files found.</span>
          )}

          {!isLoading &&
            !error &&
            data?.files.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file.key)}
                className={cn(
                  "w-24 flex-shrink-0 cursor-pointer",
                  value.includes(file.key)
                    ? "ring-2 ring-primary rounded-md border"
                    : "hover:bg-muted rounded-md border border-transparent",
                  "flex flex-col items-center"
                )}
              >
                <div className="w-24 h-24 overflow-hidden rounded-md border-b border-gray-200">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.key}
                      alt={file.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted">
                      <FileIcon className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Show full file name, allow wrapping */}
                <div
                  className="text-xs mt-2 px-1 text-center break-words whitespace-normal"
                  title={file.name}
                >
                  {file.name}
                </div>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}
