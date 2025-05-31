import { CircleArrowOutUpRight, File } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const FileCard = ({file}: { file: {
    name: string,
    id: string,
    createdAt: Date,
    size: number,
    key: string,
    type: string,
}}) => {
  return (
    <div className='flex gap-4 items-center rounded-md bg-card p-4 hover:bg-card'>
      <File className="w-8 h-8 text-blue-500" />
      <div>
        <h2>{file.name}</h2>
        <p className="text-sm">{file.type}</p>
      </div>
      <div className="grow">
      </div>
      <Link href={'https://cdn.edufly.localhook.online/'+file.key} target="_blank" className="flex items-center gap-2">
        <CircleArrowOutUpRight className="w-5 h-5 text-muted-foreground" />
      </Link>

    </div>
  )
}

export default FileCard
