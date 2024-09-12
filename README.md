<h1 align="center">type-safe-url</h1>

A lightweight TypeScript library for writing URLs in a type-safe manner.  

### Features
- Supports path parameters and query parameters
- Automatic URL encoding
- Works on both browsers and Node.js
- Tiny bundle size and 0 dependencies

With an IDE, you can list URL references and rename URL components 👍.  

### Basic example

Here is an example of how to define a URL structure and write corresponding URLs.  

```ts
import { createRootPath, urlOf, queryParams } from 'type-safe-url'

// Define URL structure
const rootPath = createRootPath<{
  setting: {
    // Nested path example: '/setting/account'
    account: {}
  }
  users: {
    // Path parameter example: '/users/ootidea'
    [id: string]: {}
  }
  blog: {
    // Query parameter example: '/blog?category=frontend'
    [queryParams]: { category?: 'frontend' | 'backend' }
  }
}>()

// Create URL strings
console.log(
  urlOf(rootPath.setting.account),                // '/setting/account'
  urlOf(rootPath.users),                          // '/users'
  urlOf(rootPath.users('ootidea')),               // '/users/ootidea'
  urlOf(rootPath.blog, { category: 'frontend' }), // '/blog?category=frontend'
)
```

### Setting the base URL

You can set the **base URL** as an option of the `createRootPath` function.  

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

### Multi-Value Query Parameters

You can define query parameters that accept multiple values.  
Simply use **array types** as below.  

```ts
import { createRootPath, urlOf, queryParams } from 'type-safe-url'

const rootPath = createRootPath<{
  articles: {
    [queryParams]: { tags?: string[] } // 👈️ Multi-value as an array
  }
}>()

console.log(
  urlOf(rootPath.articles, { tags: ['CSS', 'iOS'] }), // '/articles?tags=CSS&tags=iOS'
)
```
