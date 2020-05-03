import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { GetServerSideProps, NextPage } from 'next';
import Login from '../components/Login';
import SavedTracks from '../components/SavedTracks';
import User from '../components/User';
import { getUser, verifySession } from '../server/firebase-admin';
import { UserInfo } from '../server/models';

const useStyles = makeStyles((theme) =>
  createStyles({
    subtitle: {
      marginTop: -theme.spacing(2),
      marginLeft: theme.spacing(4),
    },
  }),
);

const IndexPage: NextPage<{
  user?: UserInfo;
}> = ({ user }) => {
  const classes = useStyles();

  return (
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
      {user && (
        <Grid item>
          <SavedTracks />
        </Grid>
      )}
      {user && (
        <Grid item>
          <Button variant="outlined" size="small" href="/api/session/logout">
            Logout
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const { uid } = await verifySession(req);
    const user = await getUser(uid);
    return { props: { user } };
  } catch (error) {
    return { props: {} };
  }
};

export default IndexPage;
