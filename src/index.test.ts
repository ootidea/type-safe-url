import { expect, test } from 'vitest'
import { createRootPath, queryParams, urlOf } from './index'

test('Path without parameters', () => {
  type PathSchema = {
    contact: {}
    about: {
      history: {}
      people: {}
    }
  }
  const rootPath = createRootPath<PathSchema>()

  expect(urlOf(rootPath)).toBe('/')
  expect(urlOf(rootPath.contact)).toBe('/contact')
  expect(urlOf(rootPath.about)).toBe('/about')
  expect(urlOf(rootPath.about.history)).toBe('/about/history')
})

test('Path parameters', () => {
  type PathSchema = {
    article: {
      [id: number]: {}
    }
    user: {
      [name: string]: { posts: {} }
    }
  }
  const rootPath = createRootPath<PathSchema>()

  expect(urlOf(rootPath.article)).toBe('/article')
  expect(urlOf(rootPath.article(123))).toBe('/article/123')
  expect(urlOf(rootPath.user('alice'))).toBe('/user/alice')
  expect(urlOf(rootPath.user('alice').posts)).toBe('/user/alice/posts')
})

test('Query parameters', () => {
  type PathSchema = {
    login: { [queryParams]: { redirectUrl: string } }
    blog: {
      [queryParams]: { order?: 'asc' | 'desc'; page?: number }
    }
  }
  const rootPath = createRootPath<PathSchema>()

  expect(urlOf(rootPath.login, { redirectUrl: 'https://example.com' })).toBe(
    '/login?redirectUrl=https%3A%2F%2Fexample.com',
  )
  expect(urlOf(rootPath.blog, {})).toBe('/blog')
  expect(urlOf(rootPath.blog, { order: 'asc' })).toBe('/blog?order=asc')
  expect(urlOf(rootPath.blog, { order: 'asc', page: 2 })).toBe('/blog?order=asc&page=2')
  expect(urlOf(rootPath.blog, { page: 2, order: 'asc' })).toBe('/blog?page=2&order=asc')
})

test('baseUrl', () => {
  type PathSchema = {
    contact: {}
    about: {
      history: {}
      people: {}
    }
  }
  const rootPath = createRootPath<PathSchema>({ baseUrl: 'https://example.com' })

  expect(urlOf(rootPath)).toBe('https://example.com/')
  expect(urlOf(rootPath.contact)).toBe('https://example.com/contact')
})
