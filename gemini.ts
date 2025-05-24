import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyD260BIGO3y8TCkZbiOnVEv1sL8iyyJlXc");

export interface CourseLesson {
  title: string;
  summary?: string;
  content?: string;
}

export interface CourseChapter {
  title: string;
  lessons: CourseLesson[];
}

export interface FullCourse {
  courseTitle: string;
  chapters: CourseChapter[];
}

export async function generateFullCourseFromFile(file: File): Promise<FullCourse | null> {
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

  const fileData = await file.arrayBuffer();

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: Buffer.from(fileData).toString('base64'),
            },
          },
          {
            text: `You're an expert course creator.

Given this PDF, create a complete course including:
- A course title
- Chapters
- Lessons within each chapter
- For each lesson, include title and content (not just summary)

If images are in the PDF, include context from them in the lessons. Add missing knowledge if helpful. Output as structured JSON using a function call.

Respond using a function call like:
createCourseOutline({ courseTitle: string, chapters: { title: string, lessons: { title: string, content: string }[] }[] })`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.6,
    },
    tools: [
      {
        functionDeclarations: [
          {
            name: 'createCourseOutline',
            description: 'Structured course content',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                courseTitle: { type: SchemaType.STRING },
                chapters: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      title: { type: SchemaType.STRING },
                      lessons: {
                        type: SchemaType.ARRAY,
                        items: {
                          type: SchemaType.OBJECT,
                          properties: {
                            title: { type: SchemaType.STRING },
                            content: { type: SchemaType.STRING },
                          },
                          required: ['title', 'content'],
                        },
                      },
                    },
                    required: ['title', 'lessons'],
                  },
                },
              },
              required: ['courseTitle', 'chapters'],
            },
          },
        ],
      },
    ],
  });

  const candidate = result.response.candidates?.[0];
  const fnCall = candidate?.content?.parts?.find((p: any) => p.functionCall)?.functionCall;

  if (fnCall?.name === 'createCourseOutline') {
    return JSON.parse(JSON.stringify(fnCall.args)) as FullCourse;
  } else if (candidate?.content?.parts?.[0]?.text) {
    try {
      const jsonString = candidate.content.parts[0].text.trim();
      // Remove the ```json and ``` if present
      const cleanedJsonString = jsonString.startsWith('```json') && jsonString.endsWith('```')
        ? jsonString.slice(7, -3).trim()
        : jsonString;
      // Attempt to parse the JSON string
      const parsedData = JSON.parse(cleanedJsonString);
      // Check if the parsed data has the expected structure
      if (parsedData && typeof parsedData === 'object' && 'courseTitle' in parsedData && 'chapters' in parsedData) {
        return parsedData as FullCourse;
      } else {
        console.error("Parsed JSON does not match the expected FullCourse structure:", parsedData);
        return null;
      }
    } catch (e) {
      console.error("Failed to parse JSON string:", e, candidate.content.parts[0].text);
      return null;
    }
  }

  return null;
}