import React, { useState, useEffect, useCallback } from 'react'
// import { useSubscription } from '@apollo/react-hooks'

// https://material-ui.com/styles/basics/#hook-api
import { makeStyles } from '@material-ui/core/styles'

// https://recharts.org/en-US/examples/SimpleLineChart
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// Chart Control Checkboxes
// https://material-ui.com/components/checkboxes/
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

// https://material-ui.com/components/tables/#dense-table
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import moment from 'moment'

import { fetchUsDaily } from '../api/endpoints'

// Advanced Data Tables display/interaction
import MUIDataTable from 'mui-datatables'

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

  tha: { // existing column header shown on CovidTracking.com
    backgroundColor: theme.palette.grey[100],
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
    paddingRight: theme.spacing(1),
  },

  tda: { // existing data shown on CovidTracking.com
    backgroundColor: theme.palette.grey[100],
    textAlign: 'right',
    whiteSpace: 'nowrap',
    wordWrap: 'break-word',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },

  formContainer: {
    display: 'flex',
    justifyContent: 'center'
  },

  formControl: {
    margin: theme.spacing(3),
  },

}))

// Interface for incoming props via match.params (URL params)
interface DailyUSProps {
}

interface DailyData {
  // https://stackoverflow.com/questions/55321867/the-error-of-duplicate-string-index-signature-at-reactjs-with-typescript
  [placeholder: string]: number // index signature allows for variable key access

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

interface DataKeys {
  [placeholder: string]: boolean // index signature allows for variable key access
  positive: boolean
  positiveIncrease: boolean
  positiveIncreasePercent: boolean

  hospitalized: boolean
  hospitalizedIncrease: boolean
  hospitalizedIncreasePercent: boolean
}

// Any string to hex color
// https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
const toHex = (str: string): string => {
  let hash = 0
  if (str.length === 0) return hash.toString()
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  var color = '#'
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 255
    color += ('00' + value.toString(16)).substr(-2)
  }
  return color
}

// TODO: Change color lighter/darker (currently not working)
// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
const changeColorBrightness = (col: string, amt: number): string => {
  const color = parseInt(col, 16)
  return (((color & 0x0000FF) + amt) | ((((color >> 8) & 0x00FF) + amt) << 8) | (((color >> 16) + amt) << 16)).toString(16)
}


const DailyUS = (props: DailyUSProps) => {

  const classes = useStyles()

  // Loading boolean allows UI to change while we wait for data
  const [loading, setLoading] = useState(true)

  // useState with Typescript Type: https://www.carlrippon.com/typed-usestate-with-typescript/
  const [dataKeys, setDataKeys] = useState<DataKeys>({
    positive: true,
    positiveIncrease: false,
    positiveIncreasePercent: false,
    hospitalized: true,
    hospitalizedIncrease: false,
    hospitalizedIncreasePercent: false,
    death: true,
    deathIncrease: false,
    deathIncreasePercent: false
  })
  // const [dataKeys, setDataKeys] = useState({})

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

      // console.log(index)
      // console.log(item)

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
    return percent > 0 ? Number(percent).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) : ''
  }

  const numberWithCommas = (num: number) => {
    return num ? num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : ''
  }

  const retrieveDailyData = useCallback(async () => {
    // REST call to fetch all states (unable to do so in GraphQL given the schema)
    const results = await fetchUsDaily()
    // console.log(results)
    const processed = processDailyData(results)
    // console.log(processed)

    setDailyDataList(processed)
    setLoading(false)
  }, [processDailyData])


  // Form Handling
  const handleCheck = (event: any) => {
    console.log(event.target.name)
    console.log(event.target.checked)

    const newKeys = {
      ...dataKeys,
      [event.target.name]: event.target.checked
    }

    console.log(newKeys)

    setDataKeys(newKeys)
  }

  // Effects
  useEffect(() => {
    if (loading) {
      retrieveDailyData()
    }
  }, [loading, processDailyData, retrieveDailyData])

  const tableHeader = (
    <TableRow>
      <TableCell className={classes.tha}>Date</TableCell>
      <TableCell className={classes.tha}>States Tracked</TableCell>

      <TableCell className={classes.tha}>Positive</TableCell>
      <TableCell className={classes.th}>+ Inc</TableCell>
      <TableCell className={classes.th}>+ % Inc</TableCell>

      <TableCell className={classes.tha}>Negative</TableCell>
      <TableCell className={classes.th}>- Inc</TableCell>
      <TableCell className={classes.th}>- % Inc</TableCell>

      <TableCell className={classes.tha}>Pos + Neg</TableCell>
      <TableCell className={classes.th}>+/- Inc</TableCell>
      <TableCell className={classes.th}>+/- % Inc</TableCell>

      <TableCell className={classes.tha}>Pending Tests</TableCell>

      <TableCell className={classes.tha}>Hospitalized</TableCell>
      <TableCell className={classes.th}>Hosp Inc</TableCell>
      <TableCell className={classes.th}>Hosp % Inc</TableCell>

      <TableCell className={classes.tha}>Deaths</TableCell>
      <TableCell className={classes.th}>Death Inc</TableCell>
      <TableCell className={classes.th}>Death % Inc</TableCell>

      <TableCell className={classes.tha}>Total Tests</TableCell>
      <TableCell className={classes.th}>Total Tests % Inc</TableCell>
    </TableRow>
  )

  const dataRows = loading ? (
    <TableRow><TableCell>LOADING</TableCell></TableRow>
  ) : (
      dailyDataList.map(data => {
        // console.log(data)

        const momentDate = moment(data.date, "YYYYMMDD")
        const formatted = momentDate.format("ddd MM/DD/YYYY")

        return (
          <TableRow key={data.date}>
            <TableCell className={classes.tda}>{formatted}</TableCell>
            <TableCell className={classes.tda}>{data.states}</TableCell>

            <TableCell className={classes.tda}>{numberWithCommas(data.positive)}</TableCell>
            <TableCell className={classes.td}>{numberWithCommas(data.positiveIncrease)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.positiveIncreasePercent)}</TableCell>

            <TableCell className={classes.tda}>{numberWithCommas(data.negative)}</TableCell>
            <TableCell className={classes.td}>{numberWithCommas(data.negativeIncrease)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.negativeIncreasePercent)}</TableCell>

            <TableCell className={classes.tda}>{numberWithCommas(data.totalTestResults)}</TableCell>
            <TableCell className={classes.td}>{numberWithCommas(data.totalTestResultsIncrease)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.totalTestResultsIncreasePercent)}</TableCell>

            <TableCell className={classes.tda}>{numberWithCommas(data.pending)}</TableCell>

            <TableCell className={classes.tda}>{numberWithCommas(data.hospitalized)}</TableCell>
            <TableCell className={classes.td}>{numberWithCommas(data.hospitalizedIncrease)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.hospitalizedIncreasePercent)}</TableCell>

            <TableCell className={classes.tda}>{numberWithCommas(data.death)}</TableCell>
            <TableCell className={classes.td}>{numberWithCommas(data.deathIncrease)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.deathIncreasePercent)}</TableCell>

            <TableCell className={classes.tda}>{numberWithCommas(data.total)}</TableCell>
            <TableCell className={classes.td}>{formatAsPercentage(data.totalTestsIncreasePercent)}</TableCell>
          </TableRow>
        )
      })
    )

  // console.log(dailyDataList)

  const columns = ["Name", "Company", "City", "State"]

  const data = [
    ["Joe James", "Test Corp", "Yonkers", "NY"],
    ["John Walsh", "Test Corp", "Hartford", "CT"],
    ["Bob Herm", "Test Corp", "Tampa", "FL"],
    ["James Houston", "Test Corp", "Dallas", "TX"],
  ]

  const opts = {
    // filterType: 'checkbox',
    download: false,
    print: false,
    search: false,
    selectableRows: "none" as any
  }

  return (
    <>
      <ResponsiveContainer width='100%' height='100%' aspect={16.0 / 5.0}>
        <LineChart
          data={dailyDataList.slice().reverse()}
          margin={{
            top: 20, right: 50, left: 50, bottom: 20
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {/* Slanted Labels: https://github.com/recharts/recharts/issues/466 */}
          {/* TODO: better way: http://recharts.org/en-US/examples/CustomizedLabelLineChart */}
          <XAxis dataKey="date" height={80} angle={-45} textAnchor="end" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* <Line type="monotone" dataKey="positive" stroke="#8884d8" /> */}
          {/* <Line type="monotone" dataKey="negative" stroke="#82ca9d" /> */}

          {/* <Line dataKey="negative" stroke="green" /> */}
          {/* <Line dataKey="positive" stroke="red" /> */}
          {/* <Line dataKey="hospitalized" stroke="purple" />
          <Line dataKey="death" stroke="black" /> */}

          {/* <Line dataKey="hospitalizedIncrease" stroke="purple" />
          <Line dataKey="deathIncrease" stroke="purple" /> */}

          {Object.keys(dataKeys).map((key: string) => {
            console.log(key)

            const value = dataKeys[key]
            console.log(value)
            console.log(toHex(key))

            const hexColor = toHex(key)
            // const finalColor = changeColorBrightness(hexColor, -2)
            return value ? (
              <Line dataKey={key} stroke={hexColor}
                animationDuration={500}
              />
            ) : ''
            // return <div>test</div>
          })}

        </LineChart>
      </ResponsiveContainer>

      <div className={classes.formContainer}>
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Cumulative</FormLabel>
          <FormGroup>

            {/* TODO: make select/deselect all work */}
            <FormControlLabel
              control={<Checkbox name="allCumulative" />}
              label="Select All"
            />

            {/* TODO: refactor to generate labels/checkboxes programmatically */}
            <FormControlLabel
              control={
                <Checkbox name="positive"
                  checked={dataKeys['positive']} onChange={e => handleCheck(e)} />
              }
              label="Positive"
            />
            <FormControlLabel
              control={
                <Checkbox name="hospitalized"
                  checked={dataKeys['hospitalized']} onChange={e => handleCheck(e)} />}
              label="Hospitalized"
            />
            <FormControlLabel
              control={
                <Checkbox name="death"
                  checked={dataKeys['death']} onChange={e => handleCheck(e)} />}
              label="Deaths"
            />
          </FormGroup>
        </FormControl>

        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Increases</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox name="allIncreases" />}
              label="Select All"
            />
            <FormControlLabel
              control={<Checkbox name="positive" />}
              label="Positive"
            />
            <FormControlLabel
              control={<Checkbox name="hospitalized" />}
              label="Hospitalized"
            />
            <FormControlLabel
              control={<Checkbox name="death" />}
              label="Deaths"
            />
          </FormGroup>
        </FormControl>

        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">% Increases</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox name="allPercent" />}
              label="Select All"
            />
            <FormControlLabel
              control={<Checkbox name="positive" />}
              label="Positive"
            />
            <FormControlLabel
              control={<Checkbox name="hospitalized" />}
              label="Hospitalized"
            />
            <FormControlLabel
              control={<Checkbox name="death" />}
              label="Deaths"
            />
          </FormGroup>
        </FormControl>
      </div>

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


      {/* https://github.com/gregnb/mui-datatables */}
      <MUIDataTable
        title={"Datatables Placeholder"}
        data={data}
        columns={columns}
        options={opts}
      />
    </>
  )
}

export default DailyUS
