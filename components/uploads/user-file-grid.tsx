"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Progress } from "../ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trash2,
  Download,
  FileIcon,
  ImageIcon,
  Video,
  FileArchive,
  Upload,
  Search,
  Grid3X3,
  List,
  MoreVertical,
  Eye,
} from "lucide-react"
import { Skeleton } from "../ui/skeleton"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type FileType = {
  id: string
  name: string
  type: string
  size: number
  key: string
  createdAt: string
}

type Response = {
  files: FileType[]
  max: number
  current: number
}

interface UserFileGridProps {
  onUpload?: () => void
}

const fileTypeFilters = [
  { value: "all", label: "All", icon: FileIcon },
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "video", label: "Videos", icon: Video },
  { value: "pdf", label: "PDFs", icon: FileIcon },
  { value: "zip", label: "Archives", icon: FileArchive },
]

const sortOptions = [
  { value: "date", label: "Date" },
  { value: "size", label: "Size" },
  { value: "name", label: "Name" },
]

function isImage(type: string) {
  return type.startsWith("image/")
}

function isVideo(type: string) {
  return type.startsWith("video/")
}

function isPDF(type: string) {
  return type === "application/pdf"
}

function isArchive(type: string) {
  return ["application/zip", "application/x-zip-compressed"].includes(type)
}

function getFileIcon(type: string) {
  if (isImage(type)) return ImageIcon
  if (isVideo(type)) return Video
  if (isPDF(type)) return FileIcon
  if (isArchive(type)) return FileArchive
  return FileIcon
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

async function getSignedUrl(key: string): Promise<string> {
  const res = await fetch("/api/upload/get", {
    method: "POST",
    body: JSON.stringify({ key }),
    headers: {
      "Content-Type": "application/json",
    },
  })
  const data = await res.json()
  return data.url
}

async function deleteFile(key: string): Promise<void> {
  const res = await fetch("/api/upload/delete", {
    method: "DELETE",
    body: JSON.stringify({ key }),
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (!res.ok) throw new Error("Failed to delete file")
}

export default function UserFileGrid({ onUpload }: UserFileGridProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  const { data: files, isLoading } = useQuery<Response>({
    queryKey: ["user-files", typeFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.append("type", typeFilter)
      if (sortBy) params.append("sort", sortBy)
      const res = await fetch(`/api/upload?${params.toString()}`)
      return res.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-files"] })
      toast.success("File deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete file")
    },
  })

  useEffect(() => {
    if (!files) return

    const fetchPreviews = async () => {
      const imageFiles = files.files.filter((file) => isImage(file.type))
      const newPreviews: Record<string, string> = {}

      await Promise.all(
        imageFiles.map(async (file) => {
          try {
            const url = await getSignedUrl(file.key)
            newPreviews[file.id] = url
          } catch {
            // handle error if needed
          }
        }),
      )

      setPreviews(newPreviews)
    }

    fetchPreviews()
  }, [files])

  const handleDelete = async (file: FileType) => {
    try {
      await deleteMutation.mutateAsync(file.key)
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const handleDownload = async (file: FileType) => {
    try {
      const url = await getSignedUrl(file.key)
      const link = document.createElement("a")
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      toast.error("Failed to download file")
    }
  }

  const handlePreview = async (file: FileType) => {
    try {
      const url = await getSignedUrl(file.key)
      window.open(url, "_blank")
    } catch (error) {
      toast.error("Failed to preview file")
    }
  }

  // Filter files based on search query
  const filteredFiles =
    files?.files?.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase())) || []

  const storagePercentage = files ? (files.current / files.max) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Files</h1>
          <p className="text-muted-foreground">Manage and organize your uploaded files</p>
        </div>

        {onUpload && (
          <Button onClick={onUpload} className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </Button>
        )}
      </div>

      {/* Storage Usage */}
      <div className="flex justify-between items-end">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>        
      <Card className="p-4 min-w-1/4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Storage Usage</h3>
          <span className="text-sm text-muted-foreground">
            {formatFileSize(files?.current || 0)} / {formatFileSize(files?.max || 0)}
          </span>
        </div>
        <Progress
          value={storagePercentage}
          className={cn(
            "h-2",
            storagePercentage > 90 && "bg-red-100",
            storagePercentage > 75 && storagePercentage <= 90 && "bg-yellow-100",
          )}
          />
        {storagePercentage > 90 && (
          <p className="text-sm text-red-600 mt-2">Storage almost full. Consider deleting some files.</p>
        )}
      </Card>
        </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 h-auto gap-1 p-1">
              {fileTypeFilters.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex flex-col items-center justify-center gap-1 h-auto py-2 px-2"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <CardContent className="p-6">
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                  : "space-y-4",
              )}
            >
              {Array.from({ length: viewMode === "grid" ? 12 : 6 }).map((_, i) => (
                <div key={i} className={cn(viewMode === "grid" ? "space-y-3" : "flex items-center gap-4 p-4")}>
                  <Skeleton className={cn(viewMode === "grid" ? "h-32 w-full" : "h-12 w-12")} />
                  <div className={cn("space-y-2", viewMode === "list" && "flex-1")}>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        ) : filteredFiles.length === 0 ? (
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <div className="p-4 rounded-full bg-muted">
                <FileIcon className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-medium">{searchQuery ? "No files found" : "No files uploaded yet"}</p>
                <p className="text-sm">
                  {searchQuery ? "Try adjusting your search or filters" : "Upload your first file to get started"}
                </p>
              </div>
              {!searchQuery && onUpload && (
                <Button onClick={onUpload} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Files
                </Button>
              )}
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-6">
            <motion.div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                  : "space-y-2",
              )}
              layout
            >
              <AnimatePresence>
                {filteredFiles.map((file) => {
                  const FileIconComponent = getFileIcon(file.type)

                  if (viewMode === "list") {
                    return (
                      <motion.div
                        key={file.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="group"
                      >
                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {isImage(file.type) && previews[file.id] ? (
                                <div className="w-10 h-10 rounded overflow-hidden">
                                  <Image
                                    src={previews[file.id] || "/placeholder.svg"}
                                    alt={file.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                  <FileIconComponent className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{file.name}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatFileSize(file.size)}</span>
                                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePreview(file)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(file)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(file)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  }

                  return (
                    <motion.div
                      key={file.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 pt-0">
                        <CardContent className="p-0 relative">
                          {isImage(file.type) ? (
                            previews[file.id] ? (
                              <div className="relative">
                                <Image
                                  src={previews[file.id] || "/placeholder.svg"}
                                  alt={file.name}
                                  width={300}
                                  height={200}
                                  className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              </div>
                            ) : (
                              <div className="h-32 bg-muted animate-pulse flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )
                          ) : (
                            <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                              <FileIconComponent className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}

                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePreview(file)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(file)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(file)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>

                        <CardFooter className="py-1 px-3">
                          <div className="w-full space-y-1">
                            <p className="text-sm font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
