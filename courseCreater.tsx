// CourseBuilder.tsx
"use client";
import React, { useState } from 'react';
import { generateFullCourseFromFile, CourseChapter } from './gemini';

export default function CourseBuilder() {
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const result = await generateFullCourseFromFile(file);
    if (result) {
      setChapters(result.chapters);
      setCourseTitle(result.courseTitle);
      setCurrentChapterIndex(0);
      setCurrentLessonIndex(0);
    }
    setLoading(false);
  }

  function nextLesson() {
    const chapter = chapters[currentChapterIndex];
    if (currentLessonIndex + 1 < chapter.lessons.length) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentChapterIndex + 1 < chapters.length) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setCurrentLessonIndex(0);
    }
  }

  const currentChapter = chapters[currentChapterIndex];
  const currentLesson = currentChapter?.lessons?.[currentLessonIndex];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Course Builder</h1>

      {!chapters.length && (
        <input
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          className="mb-4"
        />
      )}

      {loading && <p>Generating course...</p>}

      {currentLesson && (
        <div>
          <h2 className="text-xl font-semibold">{courseTitle}</h2>
          <h3 className="text-lg mt-4 font-bold">{currentChapter.title}</h3>
          <h4 className="text-md mt-2 font-medium">{currentLesson.title}</h4>
          <div className="prose prose-sm mt-2 whitespace-pre-wrap">
            {currentLesson.content}
          </div>

          <button
            onClick={nextLesson}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Next Lesson
          </button>
        </div>
      )}
    </div>
  );
}