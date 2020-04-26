import { Button } from '@material-ui/core';
import { Spotify } from 'mdi-material-ui';
import { NextPage } from 'next';

const Login: NextPage = () => {
  function openLogin(): void {
    window.open('/api/login', 'login', 'height=585,width=400');
  }

  return (
    <Button
      variant="contained"
      color="secondary"
      size="large"
      startIcon={<Spotify />}
      onClick={openLogin}
    >
      Login with Spotify
    </Button>
  );
};

export default Login;
