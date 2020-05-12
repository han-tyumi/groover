import { Button, Grid, MenuItem, Select } from '@material-ui/core';
import { fetchJson, useActionExecutor } from 'components/utils';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { PlaylistInfo } from 'server/models';

/**
 * Allows the user to start playback for a given playlist.
 */
const Play: React.FunctionComponent<{
  playlist: PlaylistInfo;
}> = ({ playlist }) => {
  const [devices, setDevices] = useState<SpotifyApi.UserDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string>();
  const [playing, setPlaying] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const executor = useActionExecutor();

  return (
    <>
      <Grid item xs={10}>
        <Select
          fullWidth
          displayEmpty
          variant="outlined"
          value={deviceId}
          onOpen={async (): Promise<void> =>
            executor('Fetching devices', async () =>
              setDevices(await fetchJson('/api/devices')),
            )
          }
          onChange={(event): void =>
            void setDeviceId(event.target.value as string | undefined)
          }
        >
          <MenuItem key={undefined} value={undefined} disabled>
            Select a device...
          </MenuItem>
          {devices.map((d) => (
            <MenuItem key={d.id || undefined} value={d.id || undefined}>
              {d.name} - {d.type}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid item xs={2}>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          disabled={!deviceId}
          onClick={(): void => {
            executor(playing ? 'Pausing' : 'Playing', async () => {
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
              enqueueSnackbar(playing ? 'Paused' : 'Playback Started', {
                variant: 'info',
              });
            });
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </Button>
      </Grid>
    </>
  );
};

export default Play;
