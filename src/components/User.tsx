import { Avatar, Card, CardHeader, Grid } from '@material-ui/core';
import { UserInfo } from '../server/models';

const User: React.FunctionComponent<{
  user: UserInfo;
}> = ({ user }) => {
  return (
    <Grid>
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
    </Grid>
  );
};

export default User;
