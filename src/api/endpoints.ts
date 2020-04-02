import { createFetchURL } from '../common/helpers'

const fetch = require('node-fetch')

// https://developer.riotgames.com/apis#league-v4/GET_getLeagueEntries
const fetchStates = async () => {
  const path = `/states/info`
  const fetchURL = createFetchURL(path)
  const response = await fetch(fetchURL)
  return response.json()
}

export { fetchStates }
