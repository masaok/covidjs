import React from 'react'
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: 'center',
    margin: theme.spacing(1)
  },
  link: {
    marginRight: theme.spacing(1)
  },
  title: {
    fontSize: 50,
  }
}))


// Interface for incoming props via match.params (URL params)
interface FooterProps {
  match: {
    params: {
      state: string
    }
  }
}

const Footer = (props: FooterProps) => {

  const classes = useStyles(props)

  return (
    <div className={classes.root}>
      Data provided by&nbsp;
      <Link
        className={classes.link}
        href="https://covidtracking.com/"
        target="_blank"
        rel="noopener"
      >The COVID Tracking Project</Link>
    </div>
  )
}

export default Footer
