import React from 'react'
import { ScrollArea } from '../ui/scroll-area'
import { Chapter } from '@/lib/types'
import { CheckCircle, } from 'lucide-react'
import { Card, CardContent } from '../ui/card'



const CourseChapters = ({courseChapters, activeChapter, setActiveChapter}: {courseChapters: Chapter[], activeChapter: string, setActiveChapter: React.Dispatch<React.SetStateAction<string | null>>}) => {
     
  return (
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {courseChapters.map((chapter) => (
              <Card
                key={chapter.id}
                className={`cursor-pointer transition-all hover:shadow-md py-0 ${
                  activeChapter === chapter.id ? "ring-2 ring-primary bg-accent py-4" : ""
                }`}
                onClick={() => setActiveChapter(chapter.id!)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 ">
                    <div className="mt-1">
                      {chapter.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                      <h4 className="font-medium text-sm leading-tight">{chapter.title}</h4>
                    {/* <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{chapter.duration}</span>
                      </div>
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
  )
}

export default CourseChapters
