import { BASE_URL } from './constants'

export const createFetchURL = (path: string) => {
  return `${BASE_URL}${path}`
}
