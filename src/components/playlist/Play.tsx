import { Button, Grid } from '@material-ui/core';
import { usePlayer } from 'client/web-player';
import { PlaylistInfo } from 'models';

/**
 * Allows the user to start playback for a given playlist.
 */
const Play: React.FunctionComponent<{
  playlist: PlaylistInfo;
  accessToken: string;
}> = ({ playlist, accessToken }) => {
  const { player, state } = usePlayer(accessToken, playlist.id);

  return (
    <Grid item xs={12}>
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={(): void =>
          void (state?.paused !== false
            ? player?.play()
            : player?.player.pause())
        }
      >
        {state?.paused !== false ? 'Play' : 'Pause'}
      </Button>
    </Grid>
  );
};

export default Play;
