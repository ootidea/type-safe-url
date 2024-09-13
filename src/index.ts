import type { MergeIntersection } from './utility'

/**
 * Symbol for specifying query parameter types in schema.
 * @example
 * type Schema = {
 *   article: {
 *     [queryParams]: { order?: 'asc' | 'desc'; page?: number }
 *   }
 * }
 */
export const queryParams = Symbol('queryParams')

/** Symbol for the internal property */
const segments = Symbol('segments')
const options = Symbol('options')

/** Options for creating URL strings. */
export type Options = {
  /** default: '' */
  baseUrl?: string
  /** default: true */
  addLeadingSlash?: boolean
  /** default: false */
  addTrailingSlash?: boolean
}

/**
 * Create a root path object according to the given schema.
 * @example without options
 * const rootPath = createRootPath<{
 *   contact: {}
 *   blog: {
 *     [id: number]: {}
 *   }
 * }>()
 *
 * @example with options
 * const rootPath = createRootPath<{
 *   contact: {}
 *   blog: {
 *     [id: number]: {}
 *   }
 * }>({ baseUrl: 'https://example.com' })
 */
export function createRootPath<PathSchema>(options: Options = {}): Path<PathSchema> {
  return createPath([], options)
}
type Path<PathSchema> = string | number extends keyof PathSchema
  ? Path_<PathSchema> & ((pathParam: string | number) => Path<PathSchema[string | number]>)
  : number extends keyof PathSchema
    ? Path_<PathSchema> & ((pathParam: number) => Path<PathSchema[number]>)
    : Path_<PathSchema>
type Path_<T> = T extends object
  ? MergeIntersection<
      { [K in keyof T]: K extends string ? Path<T[K]> : T[K] } & {
        [segments]: string[]
        [options]: Options
      }
    >
  : T

function createPath(currentSegments: string[], givenOptions: Options): any {
  return new Proxy(
    Object.assign((pathParam: unknown) => createPath([...currentSegments, String(pathParam)], givenOptions), {
      [segments]: currentSegments,
      [options]: givenOptions,
    }),
    {
      get(target, key) {
        if (key === segments || key === options) return Reflect.get(target, key)

        if (typeof key === 'symbol') {
          throw new Error(`Unknown symbol key: ${String(key)}`)
        }

        return createPath([...currentSegments, key], givenOptions)
      },
    },
  ) as any
}

/**
 * Create a URL string.
 * @example Nested path
 * const rootPath = createRootPath<{
 *   setting: {
 *     account: {}
 *   }
 * }>()
 * const url = urlOf(rootPath.setting.account) // '/setting/account'
 * @example Query parameters
 * const rootPath = createRootPath<{
 *   blog: {
 *     [queryParams]: { page?: number }
 *   }
 * }>()
 * const url = urlOf(rootPath.blog, { page: 2 }) // '/blog?page=2'
 */
export function urlOf<T extends { [segments]: string[]; [options]: Options; [queryParams]?: never }>(path: T): string
export function urlOf<
  T extends {
    [segments]: string[]
    [options]: Options
    [queryParams]: Record<string, unknown>
  },
>(
  path: T,
  // Make empty query parameters {} optional
  ...optional: Partial<T[typeof queryParams]> extends T[typeof queryParams]
    ? [givenQueryParams?: T[typeof queryParams]]
    : [givenQueryParams: T[typeof queryParams]]
): string
export function urlOf<
  T extends {
    [segments]: string[]
    [options]: Options
    [queryParams]?: Record<string, unknown>
  },
>(path: T, givenQueryParams?: NonNullable<T[typeof queryParams]>): string
export function urlOf<
  T extends {
    [segments]: string[]
    [options]: Options
    [queryParams]?: Record<string, unknown>
  },
>(path: T, givenQueryParams?: T[typeof queryParams]): string {
  const baseUrl = path[options].baseUrl ?? ''
  const pathString = (() => {
    const leadingSlash = (path[options].addLeadingSlash ?? true) ? '/' : ''
    const trailingSlash = (path[options].addTrailingSlash ?? false) ? '/' : ''
    const result = `${leadingSlash}${path[segments].map(encodeURI).join('/')}${trailingSlash}`
    if (result === '//') {
      return '/'
    }
    return result
  })()

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(givenQueryParams ?? {})) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item))
      }
    } else {
      searchParams.append(key, String(value))
    }
  }

  const queryString = searchParams.toString()
  if (queryString === '') {
    // Generate '/user' instead of '/user?' for example'.
    return `${baseUrl}${pathString}`
  }
  return `${baseUrl}${pathString}?${queryString}`
}
