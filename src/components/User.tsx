import { Avatar, Card, CardHeader, Grid, IconButton } from '@material-ui/core';
import { ExitToApp } from '@material-ui/icons';
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
          action={
            <IconButton href="/api/session/logout">
              <ExitToApp />
            </IconButton>
          }
          title={user.displayName}
        />
      </Card>
    </Grid>
  );
};

export default User;
