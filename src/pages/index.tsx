import {
  CircularProgress,
  createStyles,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import firebaseApp from '../client/firebase';
import Login from '../components/Login';
import User from '../components/User';

const useStyles = makeStyles((theme) =>
  createStyles({
    subtitle: {
      marginTop: -theme.spacing(2),
      marginLeft: theme.spacing(4),
    },
  })
);

const Index: NextPage = () => {
  const classes = useStyles();
  const [user, setUser] = useState<firebase.User | null | undefined>();

  useEffect(() => {
    const sub = firebaseApp.auth().onAuthStateChanged((u) => setUser(u));
    return (): void => sub();
  }, []);

  return user === undefined ? (
    <Grid container justify="center" alignItems="center" spacing={2}>
      <Grid item>
        <CircularProgress color="secondary" />
      </Grid>
      <Grid item>
        <Typography variant="h5">Authenticating...</Typography>
      </Grid>
    </Grid>
  ) : (
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
      <Grid item>{user ? <User user={user} /> : <Login />}</Grid>
    </Grid>
  );
};

export default Index;
