import {
  Avatar,
  Card,
  CardHeader,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
} from '@material-ui/core';
import { Pause, PlayArrow, SkipNext } from '@material-ui/icons';
import { usePlayer } from 'client/web-player';
import { PlaylistInfo } from 'models';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
    },
    controls: {
      display: 'flex',
      justifyContent: 'center',
      flex: 1,
      margin: theme.spacing(2),
    },
  }),
);

/**
 * Allows the user to start playback for a given playlist.
 */
const Play: React.FunctionComponent<{
  playlist: PlaylistInfo;
  accessToken: string;
}> = ({ playlist, accessToken }) => {
  const player = usePlayer(accessToken, playlist.id);
  const classes = useStyles();

  return (
    <Grid item xs={12}>
      <Card className={classes.root}>
        {player.current && (
          <CardHeader
            avatar={
              <Avatar
                component="a"
                variant="rounded"
                src={player.current.album.images[0].url}
                href={player.current.album.external_urls.spotify}
              />
            }
            title={player.current.name}
            subheader={`${player.current.artists
              .map((a) => a.name)
              .join(', ')} · ${player.current.album.name}`}
          />
        )}
        <div className={classes.controls}>
          <IconButton
            onClick={(): void =>
              void (player.state?.paused !== false
                ? player.play()
                : player.pause())
            }
          >
            {player.state?.paused !== false ? (
              <PlayArrow fontSize="large" />
            ) : (
              <Pause fontSize="large" />
            )}
          </IconButton>
          {player.current && (
            <IconButton onClick={(): void => void player.next()}>
              <SkipNext />
            </IconButton>
          )}
        </div>
      </Card>
    </Grid>
  );
};

export default Play;
