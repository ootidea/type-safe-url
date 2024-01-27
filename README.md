<h1 align="center">type-safe-url</h1>

A lightweight TypeScript library for writing URLs in a type-safe manner.  

### Features
- Can create schema-based type-safe URLs
- Supports path parameters and query parameters
- Automatic URL encoding
- Works on both browsers and Node.js
- Tiny bundle size and 0 dependencies

Furthermore, in editors like VS Code and WebStorm, you can list references to each URL part and rename them 👍.  

### Basic example

Here is an example of defining a schema and writing URLs.  

```ts
import { createRootPath, urlOf, queryParams } from "type-safe-url";

// Define a schema
const rootPath = createRootPath<{
  setting: {
    // Nested path: '/setting/account'
    account: {}
  }
  users: {
    // Path parameter: '/users/xe64r1'
    [id: string]: {}
  }
  blog: {
    // Query parameter: '/blog?category=frontend'
    [queryParams]: { category?: 'frontend' | 'backend' }
  }
}>()

// Create URL strings
console.log(
  urlOf(rootPath.setting.account),                // '/setting/account'
  urlOf(rootPath.users('xe64r1')),                // '/users/xe64r1'
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

### Options for trailing and leading slashes

There are options to toggle whether to add a slash to the path.  

```ts
const rootPath = createRootPath<{
  about: {
    [queryParams]: { tab?: string }
  }
}>({ addLeadingSlash: false, addTrailingSlash: true })

console.log(
  urlOf(rootPath.about),                     // 'about/'
  urlOf(rootPath.about, { tab: 'profile' }), // 'about/?tab=profile'
)
```
