import type { MakeOptionalPropertiesAcceptUndefined, MergeIntersection } from 'advanced-type-utilities'

/** Options for creating URL strings. */
export type UrlBuilderOptions = {
  /** default value: '' */
  baseUrl?: string | undefined
  /** default value: true */
  autoAddLeadingSlash?: boolean | undefined
  /** default value: false */
  autoAddTrailingSlash?: boolean | undefined
}

// The symbol used to encapsulate path segments within a PathObject
const PATH_SEGMENTS_KEY = Symbol('PATH_SEGMENTS_KEY')
// The symbol used to encapsulate a UrlBuilderOptions object within a PathObject
const OPTIONS_KEY = Symbol('OPTIONS_KEY')
// The symbol used to encapsulate
const QUERY_PARAMS_KEY = Symbol('QUERY_PARAMS_KEY')

export function createRootPathObject<UrlSchema>(options: UrlBuilderOptions = {}): PathObject<UrlSchema> {
  return createPathObject<UrlSchema>([], options)
}
function createPathObject<UrlSchema>(pathSegments: string[], options: UrlBuilderOptions): PathObject<UrlSchema> {
  return new Proxy(
    (pathParam: unknown) => {
      return createPathObject([...pathSegments, String(pathParam)], options)
    },
    {
      get(_target, key) {
        if (key === PATH_SEGMENTS_KEY) return pathSegments
        if (key === OPTIONS_KEY) return options

        return createPathObject([...pathSegments, String(key)], options)
      },
    },
  ) as any
}
type Internal = { [PATH_SEGMENTS_KEY]: string[]; [OPTIONS_KEY]: UrlBuilderOptions }
type PathObject<UrlSchema> = UrlSchema extends (pathParam: infer PathParam) => infer NestedUrlSchema
  ? MergeIntersection<
      Internal &
        ('?' extends keyof UrlSchema ? { [QUERY_PARAMS_KEY]: UrlSchema['?'] } : {}) & {
          [K in Exclude<keyof UrlSchema, '?' | symbol>]: PathObject<UrlSchema[K]>
        }
    > &
      ((pathParam: PathParam) => PathObject<NestedUrlSchema>)
  : MergeIntersection<
      Internal &
        ('?' extends keyof UrlSchema ? { [QUERY_PARAMS_KEY]: UrlSchema['?'] } : {}) & {
          [K in Exclude<keyof UrlSchema, '?' | symbol>]: PathObject<UrlSchema[K]>
        }
    >

export function urlOf<
  T extends { [PATH_SEGMENTS_KEY]: string[]; [OPTIONS_KEY]: UrlBuilderOptions; [QUERY_PARAMS_KEY]: object },
>(pathObject: T, queryParams?: MakeOptionalPropertiesAcceptUndefined<Partial<T[typeof QUERY_PARAMS_KEY]>>): string
export function urlOf<T extends { [PATH_SEGMENTS_KEY]: string[]; [OPTIONS_KEY]: UrlBuilderOptions }>(
  pathObject: T,
): string
export function urlOf<
  T extends { [PATH_SEGMENTS_KEY]: string[]; [OPTIONS_KEY]: UrlBuilderOptions; [QUERY_PARAMS_KEY]?: object },
>(pathObject: T, queryParams?: object): string {
  const { baseUrl = '', autoAddLeadingSlash = true, autoAddTrailingSlash = false } = pathObject[OPTIONS_KEY]

  const path = (() => {
    const result = `${autoAddLeadingSlash ? '/' : ''}${pathObject[PATH_SEGMENTS_KEY].map(encodeURIComponent).join('/')}${autoAddTrailingSlash ? '/' : ''}`

    if (result === '//') return '/'
    return result
  })()

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(queryParams ?? {})) {
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item))
      }
    } else {
      searchParams.append(key, String(value))
    }
  }

  const queryString = searchParams.toString()

  if (queryString === '') return `${baseUrl}${path}`
  return `${baseUrl}${path}?${queryString}`
}
