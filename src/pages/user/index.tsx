import { Grid } from '@material-ui/core';
import { NextPage } from 'next';
import { useSelector } from 'react-redux';
import User from '../../components/User';
import withAuth from '../../components/withAuth';
import { RootState } from '../../rootReducer';

const UserPage: NextPage = () => {
  const auth = useSelector((state: RootState) => state.firebase.auth);

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item>
        <User user={auth} />
      </Grid>
    </Grid>
  );
};

export default withAuth(UserPage);
