import React, { useState, useEffect } from 'react'

import SimpleLineChart from '../examples/SimpleLineChart'
import { fetchStates } from '../api/endpoints'

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

const Demo = (props: DemoProps) => {

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

  // const stateName = props.match.params.state

  return (
    <div className="App">
      <div>{loading}</div>
      <div>Commit ID: {process.env.AWS_COMMIT_ID}</div>
      <div>Job ID: {process.env.AWS_JOB_ID}</div>
      <div>Branch: {process.env.AWS_BRANCH}</div>
      <div>App ID: {process.env.AWS_APP_ID}</div>
      <div>NAME: {process.env.NAME}</div>
      <div>Build 1005</div>
      <header className="App-header">
        <SimpleLineChart />
      </header>
      <div>{states.map(item => {
        return <div>{item.name}</div>
      })}</div>
    </div>
  )
}

export default Demo
