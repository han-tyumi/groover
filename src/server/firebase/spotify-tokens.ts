import admin from 'firebase-admin';

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: admin.firestore.Timestamp;
}
