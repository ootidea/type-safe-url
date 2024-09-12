import { describe, expect, test } from 'vitest'
import { createRootPath, queryParams, urlOf } from './index'

test('Nested paths', () => {
  const rootPath = createRootPath<{
    contact: {}
    about: {
      history: {}
      people: {}
    }
  }>()

  expect(urlOf(rootPath)).toBe('/')
  expect(urlOf(rootPath.contact)).toBe('/contact')
  expect(urlOf(rootPath.about)).toBe('/about')
  expect(urlOf(rootPath.about.history)).toBe('/about/history')
})

test('Path parameters', () => {
  const rootPath = createRootPath<{
    article: {
      [id: number]: {}
    }
    user: {
      [name: string]: { posts: {} }
    }
  }>()

  expect(urlOf(rootPath.article)).toBe('/article')
  expect(urlOf(rootPath.article(123))).toBe('/article/123')
  expect(urlOf(rootPath.user('alice'))).toBe('/user/alice')
  expect(urlOf(rootPath.user('alice').posts)).toBe('/user/alice/posts')
})

describe('Query parameters', () => {
  test('URL encoding', () => {
    const rootPath = createRootPath<{
      login: { [queryParams]?: { redirectUrl: string } }
    }>()

    expect(urlOf(rootPath.login)).toBe('/login')
    expect(urlOf(rootPath.login, { redirectUrl: 'https://example.com' })).toBe(
      '/login?redirectUrl=https%3A%2F%2Fexample.com',
    )
  })

  test('Multiple query parameters', () => {
    const rootPath = createRootPath<{
      blog: {
        [queryParams]: { order?: 'asc' | 'desc'; page?: number }
      }
    }>()

    expect(urlOf(rootPath.blog)).toBe('/blog')
    expect(urlOf(rootPath.blog, { order: 'asc' })).toBe('/blog?order=asc')
    expect(urlOf(rootPath.blog, { order: 'asc', page: 2 })).toBe('/blog?order=asc&page=2')
    expect(urlOf(rootPath.blog, { page: 2, order: 'asc' })).toBe('/blog?page=2&order=asc')
  })

  test('Duplicate query parameters', () => {
    const rootPath = createRootPath<{
      items: {
        [queryParams]: { selected: number[] }
      }
    }>()

    expect(urlOf(rootPath.items, { selected: [1, 2] })).toBe('/items?selected=1&selected=2')
    expect(urlOf(rootPath.items, { selected: [] })).toBe('/items')
  })
})

test('baseUrl option', () => {
  const rootPath = createRootPath<{
    contact: {}
  }>({ baseUrl: 'https://example.com' })

  expect(urlOf(rootPath)).toBe('https://example.com/')
  expect(urlOf(rootPath.contact)).toBe('https://example.com/contact')
})

test('addLeadingSlash option', () => {
  const rootPath = createRootPath<{
    contact: {}
  }>({ addLeadingSlash: false })

  expect(urlOf(rootPath)).toBe('')
  expect(urlOf(rootPath.contact)).toBe('contact')
})

test('addTrailingSlash option', () => {
  const rootPath = createRootPath<{
    contact: {}
  }>({ addTrailingSlash: true })

  expect(urlOf(rootPath)).toBe('/')
  expect(urlOf(rootPath.contact)).toBe('/contact/')
})
