import type { MergeIntersection } from 'advanced-type-utilities'

/** Options for creating URL strings. */
export type UrlBuilderOptions = {
  /** default value: '' */
  baseUrl?: string
  /** default value: true */
  autoAddLeadingSlash?: boolean
  /** default value: false */
  autoAddTrailingSlash?: boolean
}

// The symbol used to encapsulate path segments within a PathObject
const PATH_SEGMENTS_KEY = Symbol('PATH_SEGMENTS_KEY')
// The symbol used to encapsulate a UrlBuilderOptions object within a PathObject
const OPTIONS_KEY = Symbol('OPTIONS_KEY')

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
  ? MergeIntersection<Internal & { [K in Exclude<keyof UrlSchema, symbol>]: PathObject<UrlSchema[K]> }> &
      ((pathParam: PathParam) => PathObject<NestedUrlSchema>)
  : MergeIntersection<Internal & { [K in Exclude<keyof UrlSchema, symbol>]: PathObject<UrlSchema[K]> }>

export function urlOf<T extends { [PATH_SEGMENTS_KEY]: string[]; [OPTIONS_KEY]: UrlBuilderOptions }>(
  pathObject: T,
): string {
  const { baseUrl = '', autoAddLeadingSlash = true, autoAddTrailingSlash = false } = pathObject[OPTIONS_KEY]

  const path = (() => {
    const result = `${autoAddLeadingSlash ? '/' : ''}${pathObject[PATH_SEGMENTS_KEY].map(encodeURIComponent).join('/')}${autoAddTrailingSlash ? '/' : ''}`

    if (result === '//') return '/'
    return result
  })()

  return `${baseUrl}${path}`
}
