import { MergeIntersection } from './utility'

export const queryParams = Symbol('queryParams')

const segments = Symbol('segments')

export function createRootPath<PathSchema>(): Path<PathSchema> {
  return createPath([])
}
type Path<PathSchema> = string | number extends keyof PathSchema
  ? Path_<PathSchema> & { (pathParam: string | number): Path<PathSchema[string | number]> }
  : number extends keyof PathSchema
  ? Path_<PathSchema> & { (pathParam__________: number): Path<PathSchema[number]> }
  : Path_<PathSchema>
type Path_<T> = T extends object
  ? MergeIntersection<{ [K in keyof T]: K extends string ? Path<T[K]> : T[K] } & { [segments]: string[] }>
  : T

function createPath(path: string[]): any {
  return new Proxy(
    Object.assign((pathParam: unknown) => createPath([...path, String(pathParam)]), { [segments]: path }),
    {
      get(target, key) {
        if (Reflect.has(target, key)) return Reflect.get(target, key)

        if (typeof key === 'symbol') {
          throw new Error(`Unknown symbol key: ${String(key)}`)
        }

        return createPath([...path, key])
      },
    },
  ) as any
}

// TODO: Record<keyof any, never>
export function urlOf<T extends { [segments]: string[]; [queryParams]: Record<string, unknown> }>(
  pathHolder: T,
  givenQueryParams: Omit<T[typeof queryParams], symbol>,
): string
export function urlOf<T extends { [segments]: string[]; [queryParams]?: never }>(pathHolder: T): string
export function urlOf<T extends { [segments]: string[]; [queryParams]: Record<string, unknown> }>(
  pathHolder: T,
  givenQueryParams?: Omit<T[typeof queryParams], symbol>,
): string {
  if (givenQueryParams === undefined) {
    return `/${pathHolder[segments].join('/')}`
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
      return `/${pathHolder[segments].join('/')}`
    }
    return `/${pathHolder[segments].join('/')}?${queryString}`
  }
}
