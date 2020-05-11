import { createStyles, Grid, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) =>
  createStyles({
    subtitle: {
      marginTop: -theme.spacing(2),
      marginLeft: theme.spacing(4),
    },
  }),
);

/**
 * Wrapper component which provides the app's title.
 */
const Title: React.FunctionComponent = ({ children }) => {
  const classes = useStyles();

  return (
    <Grid container alignItems="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h1" color="primary">
          <b>Groover</b>
        </Typography>
        <Typography
          className={classes.subtitle}
          variant="subtitle1"
          color="secondary"
        >
          Collaborate and listen
        </Typography>
      </Grid>
      {children}
    </Grid>
  );
};

export default Title;
