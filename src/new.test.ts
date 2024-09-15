import { describe, expect, test } from 'vitest'
import { createRootPathObject, urlOf } from './new'

test('Nested URL structure', () => {
  const rootPath = createRootPathObject<{
    introduction: {}
    components: {
      button: {}
    }
  }>()

  expect(urlOf(rootPath)).toBe('/')
  expect(urlOf(rootPath.introduction)).toBe('/introduction')
  expect(urlOf(rootPath.components)).toBe('/components')
  expect(urlOf(rootPath.components.button)).toBe('/components/button')
})

test('Path parameters', () => {
  const rootPath = createRootPathObject<{
    user: (name: string) => {
      posts: (id: number) => {}
    }
  }>()

  expect(urlOf(rootPath.user)).toBe('/user')
  expect(urlOf(rootPath.user('alice'))).toBe('/user/alice')
  expect(urlOf(rootPath.user('alice').posts)).toBe('/user/alice/posts')
  expect(urlOf(rootPath.user('alice').posts(1))).toBe('/user/alice/posts/1')
})

test('Query parameters', () => {
  const rootPath = createRootPathObject<{
    items: {
      '?': { page: number; limit: number }
    }
  }>()

  expect(urlOf(rootPath.items)).toBe('/items')
  expect(urlOf(rootPath.items, { page: 2 })).toBe('/items?page=2')
  expect(urlOf(rootPath.items, { page: 2, limit: 30 })).toBe('/items?page=2&limit=30')
  expect(urlOf(rootPath.items, { limit: 30, page: 2 })).toBe('/items?limit=30&page=2')
})

test('Multi-value query parameters', () => {
  const rootPath = createRootPathObject<{
    articles: {
      '?': { tag: string[] }
    }
  }>()

  expect(urlOf(rootPath.articles, { tag: ['css', 'html'] })).toBe('/articles?tag=css&tag=html')
  expect(urlOf(rootPath.articles, { tag: [] })).toBe('/articles')
})

describe('Options', () => {
  test('baseUrl option', () => {
    const rootPath = createRootPathObject<{
      contact: {}
    }>({ baseUrl: 'https://example.com' })

    expect(urlOf(rootPath)).toBe('https://example.com/')
    expect(urlOf(rootPath.contact)).toBe('https://example.com/contact')
  })

  test('addLeadingSlash option', () => {
    const rootPath = createRootPathObject<{
      contact: {}
    }>({ autoAddLeadingSlash: false })

    expect(urlOf(rootPath)).toBe('')
    expect(urlOf(rootPath.contact)).toBe('contact')
  })

  test('addTrailingSlash option', () => {
    const rootPath = createRootPathObject<{
      contact: {}
    }>({ autoAddTrailingSlash: true })

    expect(urlOf(rootPath)).toBe('/')
    expect(urlOf(rootPath.contact)).toBe('/contact/')
  })
})
