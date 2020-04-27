import {
  CircularProgress,
  createStyles,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { NextPage } from 'next';
import { useSelector } from 'react-redux';
import Login from '../components/Login';
import User from '../components/User';
import { RootState } from '../rootReducer';

const useStyles = makeStyles((theme) =>
  createStyles({
    subtitle: {
      marginTop: -theme.spacing(2),
      marginLeft: theme.spacing(4),
    },
  }),
);

const Index: NextPage = () => {
  const classes = useStyles();
  const auth = useSelector((state: RootState) => state.firebase.auth);

  return auth.isLoaded ? (
    <Grid container direction="column" spacing={3}>
      <Grid item>
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
      <Grid item>{auth.isEmpty ? <Login /> : <User user={auth} />}</Grid>
    </Grid>
  ) : (
    <Grid container justify="center" alignItems="center" spacing={2}>
      <Grid item>
        <CircularProgress color="secondary" />
      </Grid>
      <Grid item>
        <Typography variant="h5">Authenticating...</Typography>
      </Grid>
    </Grid>
  );
};

export default Index;
