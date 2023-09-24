import { MergeIntersection } from './utility'

export const queryParams = Symbol('queryParams')

const segments = Symbol('segments')

export function createRootPath<PathSchema>(): Path<PathSchema> {
  return createPath([])
}
type Path<PathSchema> = string | number extends keyof PathSchema
  ? Path_<PathSchema> & { (pathParam: string | number): Path<PathSchema[string | number]> }
  : number extends keyof PathSchema
  ? Path_<PathSchema> & { (pathParam: number): Path<PathSchema[number]> }
  : Path_<PathSchema>
type Path_<T> = T extends object
  ? MergeIntersection<{ [K in keyof T]: K extends string ? Path<T[K]> : T[K] } & { [segments]: string[] }>
  : T

function createPath(currentSegments: string[]): any {
  return new Proxy(
    Object.assign((pathParam: unknown) => createPath([...currentSegments, String(pathParam)]), {
      [segments]: currentSegments,
    }),
    {
      get(target, key) {
        if (Reflect.has(target, key)) return Reflect.get(target, key)

        if (typeof key === 'symbol') {
          throw new Error(`Unknown symbol key: ${String(key)}`)
        }

        return createPath([...currentSegments, key])
      },
    },
  ) as any
}

// TODO: Record<keyof any, never>
export function urlOf<T extends { [segments]: string[]; [queryParams]: Record<string, unknown> }>(
  path: T,
  givenQueryParams: Omit<T[typeof queryParams], symbol>,
): string
export function urlOf<T extends { [segments]: string[]; [queryParams]?: never }>(path: T): string
export function urlOf<T extends { [segments]: string[]; [queryParams]: Record<string, unknown> }>(
  path: T,
  givenQueryParams?: Omit<T[typeof queryParams], symbol>,
): string {
  const pathString = path[segments].map(encodeURI).join('/')
  if (givenQueryParams === undefined) {
    return `/${pathString}`
  } else {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(givenQueryParams)) {
      if (value instanceof Array) {
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
      return `/${pathString}`
    }
    return `/${pathString}?${queryString}`
  }
}
