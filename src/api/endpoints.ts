import { createFetchURL } from '../common/helpers'

const fetch = require('node-fetch')

const fetchStates = async () => {
  const path = `/states/info`
  const fetchURL = createFetchURL(path)
  const response = await fetch(fetchURL)
  return response.json()
}

const fetchUsDaily = async () => {
  const path = `/us/daily`
  const fetchURL = createFetchURL(path)
  const response = await fetch(fetchURL)
  return response.json()
}

export { fetchStates, fetchUsDaily }
