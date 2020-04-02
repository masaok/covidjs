import React, { useState, useEffect } from 'react'
// import { useSubscription } from '@apollo/react-hooks'

import SimpleLineChart from '../examples/SimpleLineChart'
import { fetchStates } from '../api/endpoints'
// import { GET_DAILY_STATE_DATA_SUBSCRIPTION } from '../graphql/queries/getDailyStateData'
// import { QUERY_DAILY_STATE_DATA } from '../graphql/queries/queryDailyStateData.ts.ignore'

// Interface for incoming props via match.params (URL params)
interface DemoProps {
  match: {
    params: {
      state: string
    }
  }
}

// A basic State object
interface State {
  state: string
  name: string
}

// Separate interface for list of State objects
// https://stackoverflow.com/questions/25469244/how-can-i-define-an-interface-for-an-array-of-objects-with-typescript/25470775
interface StateList extends Array<State> { }

// const DailyStateDataSubscription = (stateAbbr: string) => {
//   const { data, loading, error } = useSubscription(
//     GET_DAILY_STATE_DATA_SUBSCRIPTION,
//     {
//       variables: { id: stateAbbr }
//     }
//   )

//   if (loading) return 'Loading'
//   if (error) return `Error: ${error.message}`
//   if (!data) return 'None found'

//   console.log('SUB DATA:')
//   console.log(data)

//   // TODO: find a better way to return a single product from subscription
//   return data.products[0]
// }

// https://www.apollographql.com/docs/react/development-testing/static-typing/#usequery
// const { loading, data } = useQuery<RocketInventoryData, RocketInventoryVars>(
//   GET_ROCKET_INVENTORY,
//   { variables: { year: 2019 } }
// )

const Demo = (props: DemoProps) => {
  // https://tylermcginnis.com/react-router-url-parameters/
  // const data = DailyStateDataSubscription('CA')
  // console.log('DATA:')
  // console.log(data)

  // Loading boolean allows UI to change while we wait for data
  const [loading, setLoading] = useState(false)

  // Typescript requires the type here with useState for non-basic types
  const [states, setStates] = useState<StateList>([])

  useEffect(() => {
    const retrieveStates = async () => {
      // REST call to fetch all states (unable to do so in GraphQL given the schema)
      const results = await fetchStates()
      console.log(results)
      setStates(results)
      setLoading(false)
    }

    setLoading(true)
    retrieveStates()
  }, [])

  const stateName = props.match.params.state

  const statesList = loading ? (
    <div>LOADING</div>
  ) : (
      states.map(state => {
        console.log(typeof state)
        console.log(state)
        return <div>{state.name}</div>
      })
    )

  return (
    <div className="App">
      <div>{stateName}</div>
      <div>{statesList}</div>
      <header className="App-header">
        <SimpleLineChart />
      </header>
    </div>
  )
}

export default Demo
