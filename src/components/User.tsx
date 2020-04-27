import { Avatar, Card, CardHeader } from '@material-ui/core';
import { NextPage } from 'next';
import { FirebaseReducer } from 'react-redux-firebase';

const User: NextPage<{ user: FirebaseReducer.AuthState }> = ({ user }) => {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar
            alt={user.displayName || undefined}
            src={user.photoURL || undefined}
          />
        }
        title={user.displayName}
      />
    </Card>
  );
};

export default User;
