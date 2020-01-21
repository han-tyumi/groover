require('dotenv').config();

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

module.exports = {
  env: {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET
  },
  distDir: '../../dist/functions/next'
};
