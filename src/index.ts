import { MergeIntersection } from './utility'

export const queryParams = Symbol('queryParams')

const segments = Symbol('segments')
const options = Symbol('options')

export type Options = {
  baseUrl?: string
}

export function createRootPath<PathSchema>(options: Options = {}): Path<PathSchema> {
  return createPath([], options)
}
type Path<PathSchema> = string | number extends keyof PathSchema
  ? Path_<PathSchema> & { (pathParam: string | number): Path<PathSchema[string | number]> }
  : number extends keyof PathSchema
  ? Path_<PathSchema> & { (pathParam: number): Path<PathSchema[number]> }
  : Path_<PathSchema>
type Path_<T> = T extends object
  ? MergeIntersection<
      { [K in keyof T]: K extends string ? Path<T[K]> : T[K] } & { [segments]: string[]; [options]: Options }
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
        if (Reflect.has(target, key)) return Reflect.get(target, key)

        if (typeof key === 'symbol') {
          throw new Error(`Unknown symbol key: ${String(key)}`)
        }

        return createPath([...currentSegments, key], givenOptions)
      },
    },
  ) as any
}

// TODO: Record<keyof any, never>
export function urlOf<T extends { [segments]: string[]; [options]: Options; [queryParams]: Record<string, unknown> }>(
  path: T,
  givenQueryParams: Omit<T[typeof queryParams], symbol>,
): string
export function urlOf<T extends { [segments]: string[]; [options]: Options; [queryParams]?: never }>(path: T): string
export function urlOf<T extends { [segments]: string[]; [options]: Options; [queryParams]: Record<string, unknown> }>(
  path: T,
  givenQueryParams?: Omit<T[typeof queryParams], symbol>,
): string {
  const baseUrl = path[options]?.baseUrl ?? ''
  const pathString = path[segments].map(encodeURI).join('/')

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(givenQueryParams ?? {})) {
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
    return `${baseUrl}/${pathString}`
  }
  return `${baseUrl}/${pathString}?${queryString}`
}
