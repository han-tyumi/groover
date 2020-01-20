import { Button } from '@material-ui/core';
import { NextPage } from 'next';

const Index: NextPage = () => {
  async function authorize() {
    // tslint:disable-next-line: variable-name
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    if (!client_id) {
      return;
    }

    const url = new URL('https://accounts.spotify.com/authorize');
    Object.entries({
      client_id,
      response_type: 'code',
      redirect_uri: `${window.location.href}api/authorize`
    }).forEach(([key, value]) => url.searchParams.append(key, value));

    window.open(url.href, '_self');
  }

  return <Button onClick={authorize}>Authorize</Button>;
};

export default Index;
