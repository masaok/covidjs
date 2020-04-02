/**
 * https://covidtracking.com/api/
 */
import { fetchStates } from './endpoints'

interface Summoner {
  id: string
  name: string
}

// https://covidtracking.com/api/states/info
describe('fetchStates', () => {
  it('fetches properly', async () => {
    const states = await fetchStates()
    expect(states).toBeInstanceOf(Array)
    expect(states.length).toBeGreaterThan(0)
    expect(states[0].state).toEqual('AK')
    expect(states[0].name).toEqual('Alaska')
  })
})
