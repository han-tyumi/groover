import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri:
    process.env.NODE_ENV === 'production'
      ? process.env.SPOTIFY_REDIRECT_URI
      : 'https://localhost:3000/api/callback',
});

export default spotifyApi;
