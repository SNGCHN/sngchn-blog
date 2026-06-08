import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error('Usage: pnpm new:post "Post title"');
  process.exit(1);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-");
}

const postsDir = join(process.cwd(), "content", "posts");
const slug = slugify(title);
const filePath = join(postsDir, `${slug}.mdx`);

if (!existsSync(postsDir)) {
  mkdirSync(postsDir, { recursive: true });
}

if (existsSync(filePath)) {
  console.error(`Post already exists: ${filePath}`);
  process.exit(1);
}

const template = `---
title: ${title}
date: ${today()}
description: ""
tags: []
# series:
#   name: Series Name
#   slug: series-slug
#   order: 1
---

# ${title}

`;

writeFileSync(filePath, template, "utf8");
console.log(`Created ${filePath}`);
