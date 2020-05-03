import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setChecked, setLeft, setRight } from '../store/playlistSlice';
import { RootState } from '../store/rootReducer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 'auto',
    },
    cardHeader: {
      padding: theme.spacing(1, 2),
    },
    list: {
      width: 200,
      height: 230,
      backgroundColor: theme.palette.background.paper,
      overflow: 'auto',
    },
    button: {
      margin: theme.spacing(0.5, 0),
    },
  }),
);

function indexOf(
  values: SpotifyApi.SavedTrackObject[],
  searchElement: SpotifyApi.SavedTrackObject,
): number {
  return values.findIndex(({ track }) => track.id === searchElement.track.id);
}

function includes(
  values: SpotifyApi.SavedTrackObject[],
  searchElement: SpotifyApi.SavedTrackObject,
): boolean {
  return indexOf(values, searchElement) !== -1;
}

function not(
  a: SpotifyApi.SavedTrackObject[],
  b: SpotifyApi.SavedTrackObject[],
): SpotifyApi.SavedTrackObject[] {
  return a.filter((value) => !includes(b, value));
}

function intersection(
  a: SpotifyApi.SavedTrackObject[],
  b: SpotifyApi.SavedTrackObject[],
): SpotifyApi.SavedTrackObject[] {
  return a.filter((value) => includes(b, value));
}

function union(
  a: SpotifyApi.SavedTrackObject[],
  b: SpotifyApi.SavedTrackObject[],
): SpotifyApi.SavedTrackObject[] {
  return [...a, ...not(b, a)];
}

const Playlist: React.FunctionComponent<{
  tracks: SpotifyApi.SavedTrackObject[];
}> = ({ tracks }) => {
  const classes = useStyles();
  const { checked, left, right } = useSelector(
    (state: RootState) => state.playlist,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLeft(tracks));
  }, []);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: SpotifyApi.SavedTrackObject) => (): void => {
    const currentIndex = indexOf(checked, value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    dispatch(setChecked(newChecked));
  };

  const numberOfChecked = (items: SpotifyApi.SavedTrackObject[]): number =>
    intersection(checked, items).length;

  const handleToggleAll = (
    items: SpotifyApi.SavedTrackObject[],
  ) => (): void => {
    if (numberOfChecked(items) === items.length) {
      dispatch(setChecked(not(checked, items)));
    } else {
      dispatch(setChecked(union(checked, items)));
    }
  };

  const handleCheckedRight = (): void => {
    dispatch(setRight(right.concat(leftChecked)));
    dispatch(setLeft(not(left, leftChecked)));
    dispatch(setChecked(not(checked, leftChecked)));
  };

  const handleCheckedLeft = (): void => {
    dispatch(setLeft(left.concat(rightChecked)));
    dispatch(setRight(not(right, rightChecked)));
    dispatch(setChecked(not(checked, rightChecked)));
  };

  const customList = (
    title: React.ReactNode,
    items: SpotifyApi.SavedTrackObject[],
  ): JSX.Element => (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={
              numberOfChecked(items) === items.length && items.length !== 0
            }
            indeterminate={
              numberOfChecked(items) !== items.length &&
              numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{ 'aria-label': 'all items selected' }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List className={classes.list} dense component="div" role="list">
        {items.map((value: SpotifyApi.SavedTrackObject) => {
          const labelId = `transfer-list-all-item-${value.track.name}-label`;

          return (
            <ListItem
              key={value.track.id}
              role="listitem"
              button
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.includes(value)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`${value.track.name}`} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <Grid
      container
      spacing={2}
      justify="center"
      alignItems="center"
      className={classes.root}
    >
      <Grid item>{customList('Choices', left)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList('Chosen', right)}</Grid>
    </Grid>
  );
};

export default Playlist;
