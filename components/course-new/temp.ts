const temp = {
  title: "Complete Web Development Bootcamp",
  description: "Learn modern web development from scratch",
  instructor: "John Doe",
  students: 1250,
  chapters: [
    {
      id: 1,
      title: "Introduction to Web Development",
      duration: "45 min",
      completed: true,
      content: `# Welcome to Web Development!

This is your first step into the exciting world of web development. In this chapter, we'll cover the fundamentals.

<AdvancedAnimation type="particleSystem" title="Welcome to Coding Universe" props={"particleCount": 40, "color": "#3b82f6"} />

## What You'll Learn

- HTML basics
- CSS fundamentals  
- JavaScript introduction

<Quiz question="What does HTML stand for?" options={["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language"]} correct={0} />

Let's start with a simple example:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>My First Page</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>
\`\`\`

<YouTubeEmbed videoId="UB1O30fR-EE" title="HTML Basics" />

## Development Process

Here's how web development typically works:

<MermaidDiagram chart="graph TD\\nA[💡 Plan] --> B[🎨 Design]\\nB --> C[💻 Code]\\nC --> D[🧪 Test]\\nD --> E[🚀 Deploy]\\nE --> F[🔧 Maintain]\\nF --> G[📊 Analytics]\\nG --> A" title="Modern Web Development Lifecycle" type="flowchart" />

<AdvancedAnimation type="codingAnimation" title="Your First Code" props={"code": "console.log('Hello, World!');\\nconsole.log('Welcome to coding!');", "language": "javascript", "speed": 80} />

## Next Steps

Ready to dive deeper? Let's move on to the next chapter!`,
    },
    {
      id: 2,
      title: "HTML Fundamentals & Structure",
      duration: "60 min",
      completed: true,
      content: `# HTML Fundamentals

HTML is the backbone of every website. Let's explore its structure and elements.

## HTML Document Structure

Every HTML document follows a specific structure:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <!-- Content goes here -->
</body>
</html>
\`\`\`

## Common HTML Elements

Here are some common HTML elements you'll use frequently:

- **Headings**: \`<h1>\` to \`<h6>\`
- **Paragraphs**: \`<p>\`
- **Links**: \`<a>\`
- **Images**: \`<img>\`
- **Lists**: \`<ul>\`, \`<ol>\`, \`<li>\`
- **Divs**: \`<div>\`
- **Spans**: \`<span>\`

<Quiz question="Which HTML element is used for the largest heading?" options={["<h1>", "<h6>", "<header>", "<title>"]} correct={0} />

<YouTubeEmbed videoId="qz0aGYrrlhU" title="HTML Elements Explained" />

## HTML Element Hierarchy

<MermaidDiagram chart="graph TD\\nHTML[🌐 html] --> HEAD[📋 head]\\nHTML --> BODY[📄 body]\\nHEAD --> TITLE[📝 title]\\nHEAD --> META[🏷️ meta]\\nHEAD --> LINK[🔗 link]\\nBODY --> HEADER[🎯 header]\\nBODY --> MAIN[📊 main]\\nBODY --> FOOTER[🔚 footer]\\nMAIN --> SECTION[📖 section]\\nMAIN --> ARTICLE[📰 article]\\nMAIN --> DIV[📦 div]" title="HTML5 Semantic Structure" type="flowchart" />

## HTML Usage Statistics

<AdvancedAnimation type="dataVisualization" title="HTML Elements Usage" props={"data": [85, 72, 68, 45, 38, 29], "label": "Most Used HTML Elements (%)"} />

Practice these elements in the next chapter!`,
    },
    {
      id: 3,
      title: "CSS & Mathematical Concepts",
      duration: "75 min",
      completed: false,
      content: `# CSS Styling & Mathematical Concepts

CSS (Cascading Style Sheets) is what makes websites beautiful and responsive.

## CSS Basics

CSS allows you to style HTML elements:

\`\`\`css
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}
\`\`\`

## Mathematical Formulas in Web Development

Sometimes we need to display mathematical concepts. Here's the famous Einstein equation:

<MathFormula formula="E = mc^2" display="true" />

And here's an inline formula for the Pythagorean theorem: <MathFormula formula="a^2 + b^2 = c^2" display="false" />

The quadratic formula is essential in programming:

<MathFormula formula="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" display="true" />

<Quiz question="Which CSS property is used to change the text color?" options={["color", "text-color", "font-color", "background-color"]} correct={0} />

## CSS Box Model

The CSS box model is fundamental to understanding layout:

<MermaidDiagram chart="graph LR\\nContent[📄 Content] --> Padding[🔲 Padding]\\nPadding --> Border[🟫 Border]\\nBorder --> Margin[⬜ Margin]\\nMargin --> Element[🎯 Final Element]\\nstyle Content fill:#e1f5fe\\nstyle Padding fill:#f3e5f5\\nstyle Border fill:#fff3e0\\nstyle Margin fill:#e8f5e8" title="CSS Box Model Visualization" type="flowchart" />

## CSS Animation Timeline

<MermaidDiagram chart="timeline\\ntitle CSS Evolution Timeline\\n1996 : CSS 1\\n     : Basic styling\\n1998 : CSS 2\\n     : Positioning\\n     : Media types\\n2011 : CSS 3\\n     : Animations\\n     : Flexbox\\n2017 : CSS Grid\\n     : Grid layouts\\n2020 : CSS 4\\n     : Container queries" title="CSS Development History" type="timeline" />

## CSS Selectors

- **Element selector**: \`h1 { }\`
- **Class selector**: \`.my-class { }\`
- **ID selector**: \`#my-id { }\`

<YouTubeEmbed videoId="1PnVor36_40" title="CSS Fundamentals" />

## Flexbox Layout

Modern CSS layout with Flexbox:

\`\`\`css
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
\`\`\`

<AdvancedAnimation type="morphingShapes" title="CSS Transformation Demo" props={"shapes": ["circle", "square", "triangle"], "speed": 1500} />

Ready for JavaScript? Let's continue!`,
    },
    {
      id: 4,
      title: "JavaScript & Advanced Algorithms",
      duration: "90 min",
      completed: false,
      content: `# JavaScript Basics & Algorithms

JavaScript brings interactivity to your websites and involves complex algorithmic thinking.

## Variables and Data Types

\`\`\`javascript
// Variables
let name = "John";
const age = 25;
var isStudent = true;

// Arrays
let fruits = ["apple", "banana", "orange"];

// Objects
let person = {
    name: "Alice",
    age: 30,
    city: "New York"
};
\`\`\`

## Algorithm Complexity Analysis

Understanding Big O notation is crucial for efficient programming:


<MathFormula   formula="O(1) \lt O(\log n) \lt O(n) \lt O(n \log n) \lt O(n^2) \lt O(2^n)" display=true />

<MermaidDiagram chart="graph LR\\nO1[⚡ O(1)\\nConstant] --> OLogN[📈 O(log n)\\nLogarithmic]\\nOLogN --> ON[📊 O(n)\\nLinear]\\nON --> ONLogN[📈📊 O(n log n)\\nLinearithmic]\\nONLogN --> ON2[📈📈 O(n²)\\nQuadratic]\\nON2 --> O2N[💥 O(2^n)\\nExponential]\\nstyle O1 fill:#4caf50\\nstyle OLogN fill:#8bc34a\\nstyle ON fill:#ffeb3b\\nstyle ONLogN fill:#ff9800\\nstyle ON2 fill:#f44336\\nstyle O2N fill:#9c27b0" title="Algorithm Complexity Comparison" type="flowchart" />

## Network Topology in JavaScript

Understanding how data flows in modern web applications:

<AdvancedAnimation type="networkGraph" title="JavaScript Data Flow" props={"nodes": 12, "connections": 18, "animated": true} />

<Quiz question="Which keyword is used to declare a constant in JavaScript?" options={["var", "let", "const", "constant"]} correct={2} />

## Functions

\`\`\`javascript
function greet(name) {
    return "Hello, " + name + "!";
}

// Arrow function
const add = (a, b) => a + b;

// Recursive function (Fibonacci)
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

<YouTubeEmbed videoId="W6NZfCO5SIk" title="JavaScript Fundamentals" />

## Data Structure Performance

<AdvancedAnimation type="dataVisualization" title="Data Structure Operations (Time Complexity)" props={"data": [1, 5, 10, 15, 25, 100], "label": "Access Time (microseconds)"} />

## Sorting Algorithm Comparison

<MermaidDiagram chart="graph TD\\nA[🔢 Unsorted Array] --> B{Choose Algorithm}\\nB -->|Fast & Simple| C[⚡ Quick Sort\\nO(n log n)]\\nB -->|Stable| D[🔄 Merge Sort\\nO(n log n)]\\nB -->|Small Arrays| E[🐌 Bubble Sort\\nO(n²)]\\nB -->|Memory Efficient| F[🏃 Heap Sort\\nO(n log n)]\\nC --> G[✅ Sorted Array]\\nD --> G\\nE --> G\\nF --> G" title="Sorting Algorithm Decision Tree" type="flowchart" />

Great progress! You're becoming a web developer!`,
    },
  ],
}
