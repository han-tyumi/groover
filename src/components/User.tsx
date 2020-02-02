import { Avatar, Card, CardHeader } from '@material-ui/core';
import { NextPage } from 'next';

const User: NextPage<{ user: firebase.User }> = ({ user }) => {
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
