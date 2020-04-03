import React, { useState, useEffect, useCallback } from 'react'
// import { useSubscription } from '@apollo/react-hooks'

// https://material-ui.com/styles/basics/#hook-api
import { makeStyles } from '@material-ui/core/styles';

// https://material-ui.com/components/tables/#dense-table
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';


// import SimpleLineChart from '../examples/SimpleLineChart'
import { fetchUsDaily } from '../api/endpoints'
// import { GET_DAILY_STATE_DATA_SUBSCRIPTION } from '../graphql/queries/getDailyStateData'
// import { QUERY_DAILY_STATE_DATA } from '../graphql/queries/queryDailyStateData.ts.ignore'

import moment from 'moment'

const useStyles = makeStyles(theme => ({
  root: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    border: 0,
    borderRadius: 3,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
  },

  table: {
    // border: `1px solid black`
  },

  th: {
    fontWeight: 'bold',
    textAlign: 'center',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },

  td: {
    textAlign: 'right',
    whiteSpace: 'nowrap',
    wordWrap: 'break-word',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  }

}))

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

  death: number
  deathIncrease: number
  deathIncreasePercent: number

  total: number  // total tests (pos + neg + pending)
  totalTestsIncrease: number
  totalTestsIncreasePercent: number
}

// Separate interface for list of State objects
// https://stackoverflow.com/questions/25469244/how-can-i-define-an-interface-for-an-array-of-objects-with-typescript/25470775
interface DailyDataList extends Array<DailyData> { }

const DailyUS = (props: DailyUSProps) => {

  const classes = useStyles();


  // Loading boolean allows UI to change while we wait for data
  const [loading, setLoading] = useState(true)

  // Typescript requires the type here with useState for non-basic types
  const [dailyDataList, setDailyDataList] = useState<DailyDataList>([])


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

  const processDailyData = useCallback((data: DailyDataList) => {
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
      item.totalTestsIncreasePercent = calcIncreasePercent(item, prev, 'total')

      item.hospitalizedOverPositivePercent = calcRatioPercent(item, 'hospitalized', 'positive')
      item.deathOverHospitalizedPercent = calcRatioPercent(item, 'death', 'hospitalized')
      item.deathOverHospitalizedPercentToday = calcRatioPercent(item, 'deathIncrease', 'hospitalizedIncrease')

      return item
    })
  }, [])

  const formatAsPercentage = (percent: number) => {
    return percent > 0 ? Number(percent).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) : '';
  }

  const numberWithCommas = (num: number) => {
    return num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : ''
  }

  const retrieveDailyData = useCallback(async () => {
    // REST call to fetch all states (unable to do so in GraphQL given the schema)
    const results = await fetchUsDaily()
    console.log(results)
    const processed = processDailyData(results)
    setDailyDataList(processed)
    setLoading(false)

    // setLoading(true)
    // retrieveDailyData()
  }, [processDailyData])


  useEffect(() => {
    if (loading) {
      retrieveDailyData()
    }
  }, [loading, processDailyData, retrieveDailyData])


  const tableHeader = (
    <TableRow>
      <TableCell className={classes.th}>Date</TableCell>
      <TableCell className={classes.th}>States Tracked</TableCell>

      <TableCell className={classes.th}>Positive</TableCell>
      <TableCell className={classes.th}>+ Inc</TableCell>
      <TableCell className={classes.th}>+ % Inc</TableCell>

      <TableCell className={classes.th}>Negative</TableCell>
      <TableCell className={classes.th}>- Inc</TableCell>
      <TableCell className={classes.th}>- % Inc</TableCell>

      <TableCell className={classes.th}>Pos + Neg</TableCell>
      <TableCell className={classes.th}>+/- Inc</TableCell>
      <TableCell className={classes.th}>+/- % Inc</TableCell>

      <TableCell className={classes.th}>Pending</TableCell>

      <TableCell className={classes.th}>Hospitalized</TableCell>
      <TableCell className={classes.th}>Hosp Inc</TableCell>
      <TableCell className={classes.th}>Hosp % Inc</TableCell>

      <TableCell className={classes.th}>Deaths</TableCell>
      <TableCell className={classes.th}>Death Inc</TableCell>
      <TableCell className={classes.th}>Death % Inc</TableCell>

      <TableCell className={classes.th}>Total Tests</TableCell>
      <TableCell className={classes.th}>Total Tests % Inc</TableCell>
    </TableRow>
  )

  const dataRows = loading ? (
    <TableRow><TableCell>LOADING</TableCell></TableRow>
  ) : (
      dailyDataList.map(data => {
        console.log(data)

        const momentDate = moment(data.date, "YYYYMMDD")
        const formatted = momentDate.format("ddd MM/DD/YYYY")

        return (
          <TableRow key={data.date}>
            <TableCell className={classes.td}>{formatted}</TableCell>
            <TableCell className={classes.td}>{data.states}</TableCell>

            <TableCell className={classes.td}>{numberWithCommas(data.positive)}</TableCell>
            <TableCell className={classes.td}>{numberWithCommas(data.positiveIncrease)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.positiveIncreasePercent)}</TableCell>

            <TableCell className={classes.td}>{numberWithCommas(data.negative)}</TableCell>
            <TableCell className={classes.td}>{numberWithCommas(data.negativeIncrease)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.negativeIncreasePercent)}</TableCell>

            <TableCell className={classes.td}>{numberWithCommas(data.totalTestResults)}</TableCell>
            <TableCell className={classes.td}>{numberWithCommas(data.totalTestResultsIncrease)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.totalTestResultsIncreasePercent)}</TableCell>

            <TableCell className={classes.td}>{numberWithCommas(data.pending)}</TableCell>

            <TableCell className={classes.td}>{numberWithCommas(data.hospitalized)}</TableCell>
            <TableCell className={classes.td}>{numberWithCommas(data.hospitalizedIncrease)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.hospitalizedIncreasePercent)}</TableCell>

            <TableCell className={classes.td}>{numberWithCommas(data.death)}</TableCell>
            <TableCell className={classes.td}>{numberWithCommas(data.deathIncrease)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.deathIncreasePercent)}</TableCell>

            <TableCell className={classes.td}>{numberWithCommas(data.total)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.totalTestsIncreasePercent)}</TableCell>
          </TableRow>
        )
      })
    )

  return (
    <div className="App">
      {/* <div>{stateName}</div>
      <div>{statesList}</div> */}
      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="main table">
          <TableHead>
            {tableHeader}
          </TableHead>
          <TableBody>
            {dataRows}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default DailyUS
