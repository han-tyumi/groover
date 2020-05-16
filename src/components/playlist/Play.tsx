import { Button, Grid } from '@material-ui/core';
import { getPlayer } from 'client/web-player';
import { fetchJson, useActionExecutor } from 'components/utils';
import { useState } from 'react';
import { PlaylistInfo } from 'server/models';

/**
 * Allows the user to start playback for a given playlist.
 */
const Play: React.FunctionComponent<{
  playlist: PlaylistInfo;
  accessToken: string;
}> = ({ playlist, accessToken }) => {
  const [playing, setPlaying] = useState(false);
  const executor = useActionExecutor();

  return (
    <Grid item xs={12}>
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={async (): Promise<void> => {
          const { deviceId } = await getPlayer(accessToken);
          executor({
            verb: playing ? 'Pausing' : 'Playing',
            action: async () => {
              await fetchJson<{ success: boolean }>(
                `/api/playlist/${playlist.id}/${playing ? 'pause' : 'play'}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ deviceId }),
                },
              );
              setPlaying(!playing);
              return playing ? 'Paused' : 'Playback Started';
            },
            variant: 'info',
          });
        }}
      >
        {playing ? 'Pause' : 'Play'}
      </Button>
    </Grid>
  );
};

export default Play;
