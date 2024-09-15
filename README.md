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
import { createRootPathObject, urlOf } from 'type-safe-url'

// Define URL structure
const root = createRootPathObject<{
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
    '?': { category: 'frontend' | 'backend' }
  }
}>()

// Create URL strings
console.log(
  urlOf(root.setting.account),                // '/setting/account'
  urlOf(root.users),                          // '/users'
  urlOf(root.users('ootidea')),               // '/users/ootidea'
  urlOf(root.blog, { category: 'frontend' }), // '/blog?category=frontend'
)
```

### Setting the base URL

You can set the **base URL** as an option of the `createRootPathObject` function.  

```ts
const root = createRootPathObject<{
  about: {}
}>({ baseUrl: 'https://example.com' })

console.log(
  urlOf(root),       // 'https://example.com/'
  urlOf(root.about), // 'https://example.com/about'
)
```

### Options for trailing and leading slashes

There are options to toggle whether to add a slash to the path.  

```ts
const root = createRootPathObject<{
  about: {
    '?': { tab: string }
  }
}>({ autoAddLeadingSlash: false, autoAddTrailingSlash: true })

console.log(
  urlOf(root.about),                     // 'about/'
  urlOf(root.about, { tab: 'profile' }), // 'about/?tab=profile'
)
```

### Multi-Value Query Parameters

You can define query parameters that accept multiple values.  
Simply use **array types** as below.  

```ts
const root = createRootPathObject<{
  articles: {
    '?': { tags: string[] } // 👈️ Multi-value as an array
  }
}>()

console.log(
  urlOf(root.articles, { tags: ['css', 'html'] }), // '/articles?tags=css&tags=html'
)
```
