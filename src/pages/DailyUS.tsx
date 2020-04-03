import React, { useState, useEffect } from 'react'
// import { useSubscription } from '@apollo/react-hooks'

// import SimpleLineChart from '../examples/SimpleLineChart'
import { fetchUsDaily } from '../api/endpoints'
// import { GET_DAILY_STATE_DATA_SUBSCRIPTION } from '../graphql/queries/getDailyStateData'
// import { QUERY_DAILY_STATE_DATA } from '../graphql/queries/queryDailyStateData.ts.ignore'

import moment from 'moment'

// Interface for incoming props via match.params (URL params)
interface DailyUSProps {
}

interface PositiveKey {

}

interface DailyData {
  // https://stackoverflow.com/questions/55321867/the-error-of-duplicate-string-index-signature-at-reactjs-with-typescript
  [placeholder: string]: number // allows for variable key access

  date: number
  states: number

  positive: number
  positiveIncrease: number
  positiveIncreasePercent: number

  negative: number
  negativeIncrease: number
  negativeIncreasePercent: number

  totalTestResults: number // pos + neg
  totalTestResultsIncrease: number
  totalTestResultsIncreasePercent: number

  pending: number
  pendingIncrease: number

  hospitalized: number
  hospitalizedIncrease: number
  hospitalizedIncreasePercent: number
  hospitalizedOverPositivePercent: number

  death: number
  deathIncrease: number
  deathIncreasePercent: number
  deathOverHospitalizedPercent: number
  deathOverHospitalizedPercentToday: number

  total: number  // total tests (pos + neg + pending)
}

// Separate interface for list of State objects
// https://stackoverflow.com/questions/25469244/how-can-i-define-an-interface-for-an-array-of-objects-with-typescript/25470775
interface DailyDataList extends Array<DailyData> { }

const DailyUS = (props: DailyUSProps) => {

  // Loading boolean allows UI to change while we wait for data
  const [loading, setLoading] = useState(false)

  // Typescript requires the type here with useState for non-basic types
  const [dailyDataList, setDailyDataList] = useState<DailyDataList>([])

  useEffect(() => {
    const retrieveDailyData = async () => {
      // REST call to fetch all states (unable to do so in GraphQL given the schema)
      const results = await fetchUsDaily()
      console.log(results)
      const processed = processDailyData(results)
      setDailyDataList(processed)
      setLoading(false)
    }
    setLoading(true)
    retrieveDailyData()
  }, [])

  const calcRatioPercent = (data: DailyData, numerator: string, denominator: string) => {
    const numValue = data[numerator]
    const denValue = data[denominator]
    const percent = denValue > 0 ? numValue / denValue : 0
    return percent
  }

  const calcIncreasePercent = (curr: DailyData, prev: DailyData, key: string) => {
    const prevValue = prev ? prev[key] : 0
    const percent = prevValue > 0 ? (curr[key] - prevValue) / prevValue : 0
    return percent
  }

  const processDailyData = (data: DailyDataList) => {
    return data.map((item, index) => {

      // const

      console.log(index)
      console.log(item)

      // const currPositive = item.positive ? item.positive : 0

      const prev = data[index + 1]
      const prevPositive = prev ? prev.positive : 0

      const percent = prevPositive > 0 ? (item.positive - prevPositive) / prevPositive : 0
      item.positiveIncreasePercent = percent

      item.negativeIncreasePercent = calcIncreasePercent(item, prev, 'negative')
      item.totalTestResultsIncreasePercent = calcIncreasePercent(item, prev, 'totalTestResults')
      item.hospitalizedIncreasePercent = calcIncreasePercent(item, prev, 'hospitalized')
      item.deathIncreasePercent = calcIncreasePercent(item, prev, 'death')

      item.hospitalizedOverPositivePercent = calcRatioPercent(item, 'hospitalized', 'positive')
      item.deathOverHospitalizedPercent = calcRatioPercent(item, 'death', 'hospitalized')
      item.deathOverHospitalizedPercentToday = calcRatioPercent(item, 'deathIncrease', 'hospitalizedIncrease')

      return item
    })
  }

  const formatAsPercentage = (percent: number) => {
    return percent > 0 ? Number(percent).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) : '';
  }

  const numberWithCommas = (num: number) => {
    return num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : ''
  }

  const tableHeader = (
    <tr>
      <th>Date</th>
      <th>States Tracked</th>

      <th>Positive</th>
      <th>+ Inc</th>
      <th>+ % Inc</th>

      <th>Negative</th>
      <th>- Inc</th>
      <th>- % Inc</th>

      <th>Pos + Neg</th>
      <th>+/- Inc</th>
      <th>+/- % Inc</th>

      <th>Pending</th>

      <th>Hospitalized</th>
      <th>Hosp Inc</th>
      <th>Hosp % Inc</th>

      {/* <th>Hosp / Pos %</th> */}

      <th>Deaths</th>
      <th>Death Inc</th>
      <th>Death % Inc</th>

      <th>Death / Hosp %</th>
      <th>Death / Hosp % Today</th>

      <th>Total Tests</th>
    </tr>
  )

  const dataRows = loading ? (
    <tr><td>LOADING</td></tr>
  ) : (
      dailyDataList.map(data => {
        console.log(data)

        const momentDate = moment(data.date, "YYYYMMDD")
        const formatted = momentDate.format("ddd MM/DD/YYYY")

        return (
          <tr key={data.date}>
            <td>{formatted}</td>
            <td>{data.states}</td>

            <td>{numberWithCommas(data.positive)}</td>
            <td>{numberWithCommas(data.positiveIncrease)}</td>
            <td>{formatAsPercentage(data.positiveIncreasePercent)}</td>

            <td>{numberWithCommas(data.negative)}</td>
            <td>{numberWithCommas(data.negativeIncrease)}</td>
            <td>{formatAsPercentage(data.negativeIncreasePercent)}</td>

            <td>{numberWithCommas(data.totalTestResults)}</td>
            <td>{numberWithCommas(data.totalTestResultsIncrease)}</td>
            <td>{formatAsPercentage(data.totalTestResultsIncreasePercent)}</td>

            <td>{numberWithCommas(data.pending)}</td>

            <td>{numberWithCommas(data.hospitalized)}</td>
            <td>{numberWithCommas(data.hospitalizedIncrease)}</td>
            <td>{formatAsPercentage(data.hospitalizedIncreasePercent)}</td>

            {/* <td>{formatAsPercentage(data.hospitalizedOverPositivePercent)}</td> */}

            <td>{numberWithCommas(data.death)}</td>
            <td>{numberWithCommas(data.deathIncrease)}</td>
            <td>{formatAsPercentage(data.deathIncreasePercent)}</td>
            <td>{formatAsPercentage(data.deathOverHospitalizedPercent)}</td>
            <td>{formatAsPercentage(data.deathOverHospitalizedPercentToday)}</td>

            <td>{numberWithCommas(data.total)}</td>
          </tr>
        )
      })
    )

  return (
    <div className="App">
      {/* <div>{stateName}</div>
      <div>{statesList}</div> */}
      <table>
        <thead>
          {tableHeader}
        </thead>
        <tbody>
          {dataRows}
        </tbody>
      </table>
    </div>
  )
}

export default DailyUS
