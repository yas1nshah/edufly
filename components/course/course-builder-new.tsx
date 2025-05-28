"use client";

import { useEffect, useState } from "react";
import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "../mdx/index";
import { compile } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

export default function MDXEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (value: string) => void;
}) {
  const [MDXContent, setMDXContent] = useState<React.FC | null>(null);

  useEffect(() => {
    async function compileMDX() {
      try {
        const file = await compile(content, {
          outputFormat: "function-body",
          development: true,
        });

        const fn = new Function("require", "exports", `${file.value}`);
        const exports: any = {};
        fn((id: string) => {
          if (id === "react/jsx-runtime") return runtime;
          throw new Error(`Cannot require ${id}`);
        }, exports);

        setMDXContent(() => exports.default);
      } catch (err) {
        console.error("MDX compile error:", err);
        setMDXContent(() => () => <div className="text-red-500">Error rendering MDX</div>);
      }
    }

    compileMDX();
  }, [content]);

  return (
    <div className="space-y-4 mt-10">
      <textarea
        className="w-full min-h-[200px] p-2 border rounded"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write MDX here..."
      />
      <div className="border rounded p-4 bg-muted">
        <MDXProvider components={mdxComponents}>
          {MDXContent && <MDXContent />}
        </MDXProvider>
      </div>
    </div>
  );
}
