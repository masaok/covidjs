import React from 'react'
import Link from '@material-ui/core/Link'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: 'center'
  },
  link: {
    marginRight: theme.spacing(1)
  },
  title: {
    fontSize: 50,
  }
}))


// Interface for incoming props via match.params (URL params)
interface HeaderProps {
  match: {
    params: {
      state: string
    }
  }
}

const Header = (props: HeaderProps) => {

  const classes = useStyles(props)

  return (
    <div className={classes.root}>
      <div className={classes.title}>COVIDjs</div>
      <Link className={classes.link} href="/">Home</Link>
      {/* <Link className={classes.link} href="/us/daily">US Daily</Link> */}
    </div>
  )
}

export default Header
