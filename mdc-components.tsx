import type { MDXComponents } from "mdx/types"
import { Quiz } from "@/components/mdx/quiz"
import { YouTubeEmbed } from "@/components/mdx/youtube-embed"
import { CodeBlock } from "@/components/mdx/code-block"
import { Alert } from "@/components/mdx/alert"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Quiz,
    YouTubeEmbed,
    CodeBlock,
    Alert,
  }
}
