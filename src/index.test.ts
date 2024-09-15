import { describe, expect, test } from 'vitest'
import { createRootPathObject, urlOf } from './index'

test('Nested URL structure', () => {
  const root = createRootPathObject<{
    introduction: {}
    components: {
      button: {}
    }
  }>()

  expect(urlOf(root)).toBe('/')
  expect(urlOf(root.introduction)).toBe('/introduction')
  expect(urlOf(root.components)).toBe('/components')
  expect(urlOf(root.components.button)).toBe('/components/button')
})

test('Path parameters', () => {
  const root = createRootPathObject<{
    user: (name: string) => {
      posts: (id: number) => {}
    }
  }>()

  expect(urlOf(root.user)).toBe('/user')
  expect(urlOf(root.user('alice'))).toBe('/user/alice')
  expect(urlOf(root.user('alice').posts)).toBe('/user/alice/posts')
  expect(urlOf(root.user('alice').posts(1))).toBe('/user/alice/posts/1')
})

test('Query parameters', () => {
  const root = createRootPathObject<{
    items: {
      '?': { page: number; limit: number }
    }
  }>()

  expect(urlOf(root.items)).toBe('/items')
  expect(urlOf(root.items, { page: 2 })).toBe('/items?page=2')
  expect(urlOf(root.items, { page: 2, limit: 30 })).toBe('/items?page=2&limit=30')
  expect(urlOf(root.items, { limit: 30, page: 2 })).toBe('/items?limit=30&page=2')
})

test('Multi-value query parameters', () => {
  const root = createRootPathObject<{
    articles: {
      '?': { tag: string[] }
    }
  }>()

  expect(urlOf(root.articles, { tag: ['css', 'html'] })).toBe('/articles?tag=css&tag=html')
  expect(urlOf(root.articles, { tag: [] })).toBe('/articles')
})

describe('Options', () => {
  test('baseUrl option', () => {
    const root = createRootPathObject<{
      contact: {}
    }>({ baseUrl: 'https://example.com' })

    expect(urlOf(root)).toBe('https://example.com/')
    expect(urlOf(root.contact)).toBe('https://example.com/contact')
  })

  test('addLeadingSlash option', () => {
    const root = createRootPathObject<{
      contact: {}
    }>({ autoAddLeadingSlash: false })

    expect(urlOf(root)).toBe('')
    expect(urlOf(root.contact)).toBe('contact')
  })

  test('addTrailingSlash option', () => {
    const root = createRootPathObject<{
      contact: {}
    }>({ autoAddTrailingSlash: true })

    expect(urlOf(root)).toBe('/')
    expect(urlOf(root.contact)).toBe('/contact/')
  })
})
