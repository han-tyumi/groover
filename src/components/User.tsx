import { Avatar, Card, CardHeader, Grid } from '@material-ui/core';
import { UserInfo } from '../server/models';

const User: React.FunctionComponent<{
  user: UserInfo;
  tracks?: SpotifyApi.SavedTrackObject[];
}> = ({ user, tracks }) => {
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
      {tracks?.map(({ track }) => (
        <Card>
          <CardHeader
            title={`${track.name} on ${track.album.name} by ${track.artists[0].name}`}
          />
        </Card>
      ))}
    </Grid>
  );
};

export default User;
