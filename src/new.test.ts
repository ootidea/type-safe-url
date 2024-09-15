import { expect, test } from 'vitest'
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
    user: {
      [name: string]: {
        posts: {
          [ID: number]: {}
        }
      }
    }
  }>()

  expect(urlOf(rootPath.user)).toBe('/user')
  expect(urlOf(rootPath.user('alice'))).toBe('/user/alice')
  expect(urlOf(rootPath.user('alice').posts)).toBe('/user/alice/posts')
  expect(urlOf(rootPath.user('alice').posts(1))).toBe('/user/alice/posts/1')
})
