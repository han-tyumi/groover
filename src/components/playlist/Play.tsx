import {
  Avatar,
  Button,
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
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    controls: {
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
      {player.current ? (
        <Card className={classes.root}>
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
          <div className={classes.controls}>
            <IconButton
              onClick={
                player.state?.paused !== false ? player.play : player.pause
              }
            >
              {player.state?.paused !== false ? (
                <PlayArrow fontSize="large" />
              ) : (
                <Pause fontSize="large" />
              )}
            </IconButton>
            <IconButton disabled={!player.tracks?.length} onClick={player.next}>
              <SkipNext />
            </IconButton>
          </div>
        </Card>
      ) : (
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          disabled={!player.tracks?.length}
          onClick={player.play}
        >
          Play
        </Button>
      )}
    </Grid>
  );
};

export default Play;
