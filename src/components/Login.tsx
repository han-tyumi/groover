import { Button } from '@material-ui/core';
import { Spotify } from 'mdi-material-ui';

const Login: React.FunctionComponent = () => {
  return (
    <Button
      variant="contained"
      color="secondary"
      size="large"
      startIcon={<Spotify />}
      href="/api/login"
    >
      Login with Spotify
    </Button>
  );
};

export default Login;
