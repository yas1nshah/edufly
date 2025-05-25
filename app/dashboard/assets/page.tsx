"use client"

import { SiteHeader } from '@/components/site-header'
import { FileUploader } from '@/components/uploads/uploader'
import UserFileGrid from '@/components/uploads/user-file-grid'
import React, { useState } from 'react'

const AssetsPage = () => {
  const [showUploader, setShowUploader] = useState(false)
  return (
    <div>
      <SiteHeader title="Assets" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
              {
                showUploader ? <FileUploader onBack={() => setShowUploader(false)} /> : <UserFileGrid onUpload={() => setShowUploader(true)}/>
              }

            </div>
          </div>
        </div>
    </div>
  )
}

export default AssetsPage
