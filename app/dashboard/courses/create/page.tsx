'use client'

import { SiteHeader } from '@/components/site-header'
import React, { useState } from 'react'
import { CompactFileSelection } from '@/components/uploads/file-selection'
import AiCourseBuilder from '@/components/course-new/ai-course-builder'

import { Sparkles, Upload, Files } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUploader } from '@/components/uploads/uploader'

const CreateCoursePage = () => {
  const [selected, setSelected] = useState<string[]>([])
  const [showUploader, setShowUploader] = useState(false)

  const handleUploadComplete = (fileIds: string[]) => {
    // Automatically select newly uploaded files
    setSelected(prev => [...prev, ...fileIds])
    // Hide uploader after successful upload
    setShowUploader(false)
  }

  const handleFileSelectionChange = (newSelected: string[]) => {
    setSelected(newSelected)
  }

  return (
    <div>
      <SiteHeader title="Create Course" />
      <div className="mx-auto max-w-6xl">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">AI Course Builder</h2>
              </div>
              <p className="text-muted-foreground">
                Add your content sources and let AI create a comprehensive course structure
              </p>
            </div>

            {showUploader ? (
              <Card className="p-6">
                <FileUploader
                  fileType="application/pdf"
                  onBack={() => setShowUploader(false)}
                  onUploadComplete={handleUploadComplete}
                />
              </Card>
            ) : (
              <Tabs defaultValue="select" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="select" className="flex items-center gap-2">
                    <Files className="w-4 h-4" />
                    Select Files
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload New
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="select" className="space-y-4">
                  <CompactFileSelection
                    value={selected}
                    onChange={handleFileSelectionChange}
                    fileType="application/pdf"
                  />
                  
                  {selected.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {selected.length} file{selected.length !== 1 ? 's' : ''} selected for course creation
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-4">
                  <Card className="p-6">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="p-4 rounded-full bg-muted">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Upload PDF Files</h3>
                        <p className="text-muted-foreground">
                          Upload your PDF documents to use as course content sources
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowUploader(true)}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Start Upload
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {selected.length > 0 && !showUploader && (
              <AiCourseBuilder selected={selected} />
            )}

            {/* Debug info - remove in production */}
            {/* {selected.length > 0 && (
              <Card className="p-4 bg-muted/50">
                <div className="text-sm">
                  <strong>Selected files:</strong> {JSON.stringify(selected, null, 2)}
                </div>
              </Card>
            )} */}
        </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCoursePage