"use client";
import { CourseBuilder } from "@/components/course-new/course-builder";
import MDXEditor from "@/components/course/course-builder-new";
import { FileUploader } from "@/components/uploads/uploader";
import CourseCreator from "@/courseCreater";
import Image from "next/image";

export default function Home() {
  return (
    <div >
      {/* <CourseCreator /> */}
      {/* <FileUploader/> */}
      <CourseBuilder />
    </div>
  );
}
