"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useDropzone } from "react-dropzone"
import { v4 as uuid } from "uuid"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, File, ImageIcon, Video, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type FileItem = {
  id: string
  file: File
  status: "pending" | "uploading" | "done" | "error"
  progress: number
  preview?: string
}

interface FileUploaderProps {
  onBack?: () => void
  fileType?: string
  onUploadComplete?: (fileIds: string[]) => void
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("video/")) return Video
  if (type.includes("pdf") || type.includes("text")) return FileText
  return File
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function getAcceptTypes(fileType?: string) {
  if (!fileType) {
    return {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".md", ".csv"],
      "application/*": [".zip", ".rar", ".7z"],
    }
  }

  const acceptTypes: Record<string, string[]> = {}
  
  switch (fileType) {
    case "application/pdf":
      acceptTypes["application/pdf"] = [".pdf"]
      break
    case "image/*":
      acceptTypes["image/*"] = [".png", ".jpg", ".jpeg", ".gif", ".webp"]
      break
    case "video/*":
      acceptTypes["video/*"] = [".mp4", ".mov", ".avi", ".mkv"]
      break
    case "text/*":
      acceptTypes["text/*"] = [".txt", ".md", ".csv"]
      break
    case "application/*":
      acceptTypes["application/*"] = [".zip", ".rar", ".7z"]
      break
    default:
      acceptTypes[fileType] = []
      break
  }
  
  return acceptTypes
}

function getFileTypeLabel(fileType?: string) {
  if (!fileType) return "all file types"
  
  switch (fileType) {
    case "application/pdf":
      return "PDF files"
    case "image/*":
      return "images"
    case "video/*":
      return "videos"
    case "text/*":
      return "text files"
    case "application/*":
      return "archive files"
    default:
      return fileType.replace("/*", " files")
  }
}

export function FileUploader({ onBack, fileType, onUploadComplete }: FileUploaderProps) {
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<FileItem[]>([])

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      const fileItem: FileItem = {
        id: uuid(),
        file,
        status: "pending",
        progress: 0,
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === fileItem.id ? { ...f, preview: e.target?.result as string } : f)),
          )
        }
        reader.readAsDataURL(file)
      }

      return fileItem
    })
    setFiles((prev) => [...prev, ...newFiles])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: getAcceptTypes(fileType),
  })

  const confirmUpload = async ({
    key,
    size,
    name,
    type,
    tags,
  }: {
    key: string
    size: number
    name: string
    type: string
    tags?: string[]
  }) => {
    const response = await fetch("/api/upload/confirm", {
      method: "POST",
      body: JSON.stringify({ key, size, name, type, tags }),
      headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    return data.id // Return the file ID from the database
  }

  const uploadFile = async (item: FileItem) => {
    const file = item.file

    // 1. Get signed URL
    const res = await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        tags: [],
      }),
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) throw new Error("Presigned URL fetch failed")

    const { url, key } = await res.json()

    // 2. Upload to R2 with progress simulation
    const xhr = new XMLHttpRequest()

    return new Promise<string>((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, progress } : f)))
        }
      })

      xhr.addEventListener("load", async () => {
        if (xhr.status === 200) {
          // 3. Confirm upload to DB and get file ID
          const fileId = await confirmUpload({
            key,
            size: file.size,
            name: file.name,
            type: file.type,
            tags: [],
          })
          resolve(fileId)
        } else {
          reject(new Error("Upload failed"))
        }
      })

      xhr.addEventListener("error", () => reject(new Error("Upload failed")))

      xhr.open("PUT", url)
      xhr.setRequestHeader("Content-Type", file.type)
      xhr.send(file)
    })
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const { mutateAsync: uploadAllFiles, isPending } = useMutation({
    mutationFn: async () => {
      const pendingFiles = files.filter((f) => f.status === "pending")
      const uploadedFileIds: string[] = []

      for (const item of pendingFiles) {
        setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 0 } : f)))

        try {
          const fileId = await uploadFile(item)
          uploadedFileIds.push(fileId)

          setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "done", progress: 100 } : f)))
        } catch (err) {
          console.error(err)
          toast.error(`Failed to upload ${item.file.name}`)
          setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", progress: 0 } : f)))
        }
      }

      if (uploadedFileIds.length > 0) {
        toast.success(`${uploadedFileIds.length} file${uploadedFileIds.length !== 1 ? 's' : ''} uploaded successfully!`)
        onUploadComplete?.(uploadedFileIds)
      }
    },

    onSuccess: () => {
      toast.success("All uploads complete!")
      queryClient.invalidateQueries({ queryKey: ["ai-builder-files"] })
    },
  })

  const pendingFiles = files.filter((f) => f.status === "pending")
  const hasFiles = files.length > 0
  const fileTypeLabel = getFileTypeLabel(fileType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Upload Files</h2>
          <p className="text-muted-foreground">
            {fileType 
              ? `Upload ${fileTypeLabel} by dragging and dropping or clicking to browse`
              : "Drag and drop your files or click to browse"
            }
          </p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Files
          </Button>
        )}
      </div>

      {/* Drop Zone */}
      <Card className="relative overflow-hidden p-4">
        <div {...getRootProps()}>
        <motion.div
          className={cn(
            "relative p-12 text-center cursor-pointer transition-all duration-300",
            "border-2 border-dashed rounded-lg",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          )}
          whileHover={{ scale: hasFiles ? 1 : 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input {...getInputProps()} />

          <motion.div
            className="flex flex-col items-center gap-4"
            animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          >
            <div
              className={cn(
                "p-4 rounded-full transition-colors",
                isDragActive ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? "Drop files here" : "Choose files or drag them here"}
              </p>
              <p className="text-sm text-muted-foreground">
                {fileType 
                  ? `Supports ${fileTypeLabel} up to 10MB each`
                  : "Supports images, videos, PDFs, and documents up to 10MB each"
                }
              </p>
            </div>
          </motion.div>

          {isDragActive && (
            <motion.div
              className="absolute inset-0 bg-primary/10 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </motion.div>
         </div>
      </Card>

      {/* File List */}
      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Files ({files.length})</h3>
              {pendingFiles.length > 0 && (
                <Button onClick={() => uploadAllFiles()} disabled={isPending} className="gap-2">
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload {pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {files.map((fileItem) => {
                  const FileIcon = getFileIcon(fileItem.file.type)

                  return (
                    <motion.div
                      key={fileItem.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="group"
                    >
                      <Card className="p-4">
                        <div className="flex items-center gap-4">
                          {/* File Preview/Icon */}
                          <div className="flex-shrink-0">
                            {fileItem.preview ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={fileItem.preview || "/placeholder.svg"}
                                  alt={fileItem.file.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <FileIcon className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium truncate pr-2">{fileItem.file.name}</p>
                              <div className="flex items-center gap-2">
                                {fileItem.status === "done" && <CheckCircle className="w-5 h-5 text-green-500" />}
                                {fileItem.status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                                {fileItem.status === "uploading" && (
                                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                )}
                                {fileItem.status === "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(fileItem.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                              <span>{formatFileSize(fileItem.file.size)}</span>
                              <span className="capitalize">{fileItem.status}</span>
                            </div>

                            {(fileItem.status === "uploading" || fileItem.status === "done") && (
                              <Progress value={fileItem.progress} className="h-2" />
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}