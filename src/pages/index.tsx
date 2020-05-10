import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import Login from 'components/Login';
import { fetchJson } from 'components/playlist/utils';
import User from 'components/User';
import { GetServerSideProps, NextPage } from 'next';
import { getUser, verifySession } from 'server/firebase-admin';
import { PlaylistInfo, UserInfo } from 'server/models';

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
          <Button
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
            onClick={async (): Promise<void> => {
              const id = (await fetchJson<PlaylistInfo>('/api/create')).id;
              window.location.assign(`/edit/${id}`);
            }}
          >
            Create
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
