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

// Define your URL structure
const root = createRootPathObject<{
  company: {    // '/company'
    access: {}  // '/company/access'
    history: {} // '/company/history'
  }
}>()

// Create URL strings
console.log(
  urlOf(root),                // '/'
  urlOf(root.company.access), // '/company/access'
)
```

### Path parameters

Path parameters are represented using **function types** as follows:  

```ts
const root = createRootPathObject<{
  user: (name: string) => {   // 👈️ Path parameter
    profile: {}
    posts: (id: number) => {} // 👈️ Nested path parameter
  }
}>()

console.log(
  urlOf(root.user),                  // '/user'
  urlOf(root.user('alice')),         // '/user/alice'
  urlOf(root.user('alice').posts),   // '/user/alice/posts'
  urlOf(root.user('alice').posts(1)) // '/user/alice/posts/1'
)
```

### Query parameters

Query parameters are represented as follows:  

```ts
const root = createRootPathObject<{
  items: {
    '?': { page: number; limit: number }
  }
}>()

console.log(
  urlOf(root.items),                         // '/items'
  urlOf(root.items, { page: 2 }),            // '/items?page=2'
  urlOf(root.items, { page: 2, limit: 30 }), // '/items?page=2&limit=30'
)
```

### Options for creating URL strings

You can configure the base URL and slashes at both ends.

```ts
const root = createRootPathObject<{
  about: {}
}>({
  baseUrl: 'https://example.com/',
  autoAddLeadingSlash: false,
  autoAddTrailingSlash: true,
})

console.log(urlOf(root.about)) // 'https://example.com/about/'
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
