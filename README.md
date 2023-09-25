<h1 align="center">type-safe-url</h1>

A lightweight library for writing URLs in a type-safe manner.  

## Features
- Supports path parameters, query parameters, and even fragments (hash)
- Automatic URL encoding
- Tiny bundle size (of course, 0 dependencies)
- Works on both browsers and Node.js

## Basic example

```ts
import { createRootPath, urlOf } from "type-safe-url";

// Define a path schema
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

console.log(urlOf(rootPath.setting.account)) // '/setting/account'
console.log(urlOf(rootPath.users('alice'))) // '/users/alice'
console.log(urlOf(rootPath.blog, { category: 'frontend' })) // '/blog?category=frontend'
```

<table>
<tr><td>expression</td><td>value</td></tr>
<tr><td>

```typescript
urlOf(rootPath.setting.account)
```
</td><td>

```typescript
'/settings/account'
```
</td></tr>
<tr><td>

```typescript
urlOf(rootPath.users('alice'))
```
</td><td>

```typescript
'/users/alice'
```
</td></tr>
<tr><td>

```typescript
urlOf(rootPath.setting.account)
```
</td><td>

```typescript
'/settings/account'
```
</td></tr>
<tr><td>

`urlOf(rootPath.users('alice'))`
</td><td>

`'/users/alice'`

</td></tr>

</table>
