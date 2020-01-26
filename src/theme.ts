import { blueGrey, lightBlue } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: lightBlue,
    secondary: blueGrey
  }
});

export default theme;
