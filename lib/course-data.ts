import type { Chapter } from "./types"

export const chapters: Chapter[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    order: 1,
    lessons: [
      {
        id: "introduction",
        title: "Introduction to Web Development",
        completed: true,
        content: `
# Introduction to Web Development

Welcome to the course! In this lesson, we'll cover the basics of web development and what you'll learn throughout this course.

Web development is the process of building and maintaining websites. It involves a combination of:

- **HTML** for structure
- **CSS** for styling
- **JavaScript** for interactivity

<Alert type="info">
  This course assumes no prior knowledge of web development. We'll start from the very basics.
</Alert>

## What You'll Learn

By the end of this course, you'll be able to:

1. Build responsive websites using HTML, CSS, and JavaScript
2. Understand modern web development workflows
3. Deploy your websites to the internet

<YouTubeEmbed videoId="gT0Lh1eYk78" title="Introduction to Web Development" />

## Let's Test Your Knowledge

<Quiz
  question="What are the three main technologies used in web development?"
  options={[
    { id: "a", text: "HTML, CSS, JavaScript" },
    { id: "b", text: "Python, Java, C++" },
    { id: "c", text: "React, Angular, Vue" },
    { id: "d", text: "MongoDB, Express, Node.js" }
  ]}
  correctOptionId="a"
  explanation="HTML, CSS, and JavaScript are the three core technologies of the World Wide Web. HTML provides structure, CSS provides styling, and JavaScript provides interactivity."
/>

In the next lesson, we'll dive deeper into HTML and start building our first webpage.
        `,
      },
      {
        id: "setup",
        title: "Setting Up Your Development Environment",
        completed: false,
        content: `
# Setting Up Your Development Environment

Before we start coding, we need to set up our development environment. This includes installing the necessary tools and software.

## Required Tools

1. **Text Editor**: We recommend Visual Studio Code, but you can use any text editor you're comfortable with.
2. **Web Browser**: Chrome or Firefox are recommended for their developer tools.
3. **Git**: For version control (optional but recommended).

<Alert type="warning">
  Make sure you have administrative privileges on your computer to install software.
</Alert>

## Installing Visual Studio Code

Visual Studio Code (VS Code) is a free, open-source code editor developed by Microsoft. It's lightweight, powerful, and has a large extension marketplace.

<YouTubeEmbed videoId="S320N3sxinE" title="Installing Visual Studio Code" />

## VS Code Extensions for Web Development

Here are some useful extensions for web development:

<CodeBlock language="bash">
# Install these extensions in VS Code
- Live Server
- Prettier - Code formatter
- ESLint
- HTML CSS Support
- JavaScript (ES6) code snippets
</CodeBlock>

## Let's Test Your Setup

<Quiz
  question="Which of the following is NOT a recommended tool for web development in this course?"
  options={[
    { id: "a", text: "Visual Studio Code" },
    { id: "b", text: "Chrome or Firefox" },
    { id: "c", text: "Adobe Photoshop" },
    { id: "d", text: "Git" }
  ]}
  correctOptionId="c"
  explanation="While Adobe Photoshop is useful for design work, it's not a core tool for web development coding. We focus on text editors, browsers, and version control tools."
/>

In the next lesson, we'll write our first HTML document.
        `,
      },
    ],
  },
  {
    id: "html-basics",
    title: "HTML Fundamentals",
    order: 2,
    lessons: [
      {
        id: "html-intro",
        title: "Introduction to HTML",
        completed: false,
        content: `
# Introduction to HTML

HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It defines the structure and content of your web page.

## Basic HTML Structure

Every HTML document follows a basic structure:

<CodeBlock language="html">
console.log(helloworld)
</CodeBlock>

<Alert type="info">
  The <!DOCTYPE html> declaration defines that this document is an HTML5 document.
</Alert>

## Common HTML Elements

Here are some common HTML elements you'll use frequently:

- **Headings**: \`<h1>\` to \`<h6>\`
- **Paragraphs**: \`<p>\`
- **Links**: \`<a>\`
- **Images**: \`<img>\`
- **Lists**: \`<ul>\`, \`<ol>\`, \`<li>\`
- **Divs**: \`<div>\`
- **Spans**: \`<span>\`

<YouTubeEmbed videoId="UB1O30fR-EE" title="HTML Crash Course" />

## Let's Test Your Knowledge

<Quiz
  question="Which HTML element is used to define the main heading of a webpage?"
  options={[
    { id: "a", text: "<heading>" },
    { id: "b", text: "<h1>" },
    { id: "c", text: "<head>" },
    { id: "d", text: "<main>" }
  ]}
  correctOptionId="b"
  explanation="The <h1> element is used to define the main heading of a webpage. It represents the most important heading on the page."
/>

In the next lesson, we'll explore more HTML elements and how to structure a webpage.
        `,
      },
      {
        id: "html-elements",
        title: "HTML Elements and Attributes",
        completed: false,
        content: `
# HTML Elements and Attributes

In this lesson, we'll dive deeper into HTML elements and learn about attributes.

## HTML Attributes

Attributes provide additional information about HTML elements. They are always specified in the start tag and usually come in name/value pairs like: name="value".

<CodeBlock language="html">
<a href="https://www.example.com" target="_blank">Visit Example.com</a>
</CodeBlock>

In this example:
- \`href\` is an attribute that specifies the URL of the page the link goes to
- \`target\` is an attribute that specifies where to open the linked document

<Alert type="success">
  Using appropriate attributes makes your HTML more accessible and functional.
</Alert>

## Common HTML Attributes

- \`class\`: Specifies one or more class names for an element
- \`id\`: Specifies a unique id for an element
- \`style\`: Specifies an inline CSS style for an element
- \`src\`: Specifies the URL of an image or script
- \`alt\`: Specifies alternative text for an image

<YouTubeEmbed videoId="yTmhLuWxjp8" title="HTML Attributes Tutorial" />

## Semantic HTML

Semantic HTML elements clearly describe their meaning to both the browser and the developer.

Examples of semantic elements:
- \`<header>\`
- \`<footer>\`
- \`<nav>\`
- \`<article>\`
- \`<section>\`
- \`<aside>\`

<CodeBlock language="html">
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>Article Title</h1>
    <p>Article content goes here...</p>
  </article>
</main>
<footer>
  <p>&copy; 2023 My Website</p>
</footer>
</CodeBlock>

## Let's Test Your Knowledge

<Quiz
  question="What is the purpose of the 'alt' attribute in an image tag?"
  options={[
    { id: "a", text: "To specify the image source" },
    { id: "b", text: "To provide alternative text if the image cannot be displayed" },
    { id: "c", text: "To set the image dimensions" },
    { id: "d", text: "To add a border around the image" }
  ]}
  correctOptionId="b"
  explanation="The 'alt' attribute provides alternative text for an image if the image cannot be displayed. It's also important for accessibility as screen readers will read this text to visually impaired users."
/>

In the next lesson, we'll start learning about CSS and how to style our HTML elements.
        `,
      },
    ],
  },
  {
    id: "css-basics",
    title: "CSS Fundamentals",
    order: 3,
    lessons: [
      {
        id: "css-intro",
        title: "Introduction to CSS",
        completed: false,
        content: `
# Introduction to CSS

CSS (Cascading Style Sheets) is used to style and layout web pages. It controls how HTML elements are displayed on screen.

## How to Add CSS to HTML

There are three ways to add CSS to HTML:

1. **Inline CSS**: Using the style attribute in HTML elements
2. **Internal CSS**: Using the \`<style>\` element in the \`<head>\` section
3. **External CSS**: Using a separate CSS file linked with the \`<link>\` element

<CodeBlock language="html">
<!-- External CSS -->
<head>
  <link rel="stylesheet" href="styles.css">
</head>

<!-- Internal CSS -->
<head>
  <style>
    body {
      background-color: #f0f0f0;
      font-family: Arial, sans-serif;
    }
  </style>
</head>

<!-- Inline CSS -->
<p style="color: blue; font-size: 16px;">This is a paragraph.</p>
</CodeBlock>

<Alert type="info">
  External CSS is the most recommended approach as it separates content (HTML) from presentation (CSS).
</Alert>

## CSS Selectors

CSS selectors are used to "find" (or select) the HTML elements you want to style.

<CodeBlock language="css">
/* Element selector */
p {
  color: red;
}

/* Class selector */
.highlight {
  background-color: yellow;
}

/* ID selector */
#header {
  font-size: 24px;
}

/* Descendant selector */
article p {
  line-height: 1.5;
}
</CodeBlock>

<YouTubeEmbed videoId="1PnVor36_40" title="CSS Crash Course" />

## Let's Test Your Knowledge

<Quiz
  question="Which CSS selector would you use to style all elements with the class 'button'?"
  options={[
    { id: "a", text: "#button" },
    { id: "b", text: "button" },
    { id: "c", text: ".button" },
    { id: "d", text: "*button" }
  ]}
  correctOptionId="c"
  explanation="The class selector in CSS starts with a period (.) followed by the class name. So '.button' would select all elements with the class 'button'."
/>

In the next lesson, we'll explore CSS properties and values in more detail.
        `,
      },
    ],
  },
  {
    id: "javascript-basics",
    title: "JavaScript Fundamentals",
    order: 4,
    lessons: [
      {
        id: "js-intro",
        title: "Introduction to JavaScript",
        completed: false,
        content: `
# Introduction to JavaScript

JavaScript is a programming language that allows you to implement complex features on web pages. It's what makes web pages interactive.

## How to Add JavaScript to HTML

There are two ways to add JavaScript to HTML:

1. **Internal JavaScript**: Using the \`<script>\` element in the HTML document
2. **External JavaScript**: Using a separate JavaScript file linked with the \`<script>\` element

<CodeBlock language="html">
<!-- Internal JavaScript -->
<script>
  function greet() {
    alert('Hello, World!');
  }
</script>

<!-- External JavaScript -->
<script src="script.js"></script>
</CodeBlock>

<Alert type="info">
  It's best practice to place JavaScript code at the bottom of the HTML body to ensure the page loads first.
</Alert>

## JavaScript Basics

Let's look at some basic JavaScript concepts:

<CodeBlock language="javascript">
// Variables
let name = 'John';
const age = 30;
var isStudent = true;

// Functions
function greet(name) {
  return 'Hello, ' + name + '!';
}

// Arrays
const fruits = ['Apple', 'Banana', 'Orange'];

// Objects
const person = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  fullName: function() {
    return this.firstName + ' ' + this.lastName;
  }
};

// Conditional statements
if (age >= 18) {
  console.log('You are an adult');
} else {
  console.log('You are a minor');
}

// Loops
for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}
</CodeBlock>

<YouTubeEmbed videoId="W6NZfCO5SIk" title="JavaScript Crash Course" />

## Let's Test Your Knowledge

<Quiz
  question="Which of the following is the correct way to declare a constant variable in JavaScript?"
  options={[
    { id: "a", text: "var name = 'John';" },
    { id: "b", text: "let name = 'John';" },
    { id: "c", text: "const name = 'John';" },
    { id: "d", text: "variable name = 'John';" }
  ]}
  correctOptionId="c"
  explanation="In JavaScript, 'const' is used to declare a constant variable whose value cannot be reassigned. 'let' and 'var' are used for variables that can be reassigned."
/>

In the next lesson, we'll explore JavaScript DOM manipulation to make our web pages interactive.
        `,
      },
    ],
  },
]
