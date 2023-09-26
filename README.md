<span />
<h1 align="center">type-safe-url</h1>

A lightweight TypeScript library for writing URLs in a type-safe manner.  

### Features
- Supports path parameters, query parameters, and even fragments (hash)
- Automatic URL encoding
- Tiny bundle size (of course, 0 dependencies)
- Works on both browsers and Node.js

### Basic example

Here is an example of defining a schema and writing URLs.  

```ts
import { createRootPath, urlOf, queryParams } from "type-safe-url";

// Define a schema
const rootPath = createRootPath<{
  setting: { account: {} }
  users: {
    // Path parameters
    [id: string]: {}
  }
  blog: {
    // Query parameters
    [queryParams]: { category?: 'frontend' | 'backend' }
  }
}>()

// Create URL strings
console.log(
  urlOf(rootPath.setting.account),                // '/setting/account'
  urlOf(rootPath.users('alice')),                 // '/users/alice'
  urlOf(rootPath.users),                          // '/users'
  urlOf(rootPath.blog, { category: 'frontend' }), // '/blog?category=frontend'
)
```

### Setting the base URL

You can set the **base URL** by providing options to the `createRootPath` function.  

```ts
const rootPath = createRootPath<{
  about: {}
}>({ baseUrl: 'https://example.com' })

console.log(
  urlOf(rootPath),       // 'https://example.com/'
  urlOf(rootPath.about), // 'https://example.com/about'
)
```
