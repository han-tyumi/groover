export interface UserInfo {
  /** The ID corresponding to the user. */
  uid: string;

  /** The user's public facing display name. */
  displayName: string | null;

  /** The user's email. */
  email: string | null;

  /** URL to the user's associated photo. */
  photoURL: string | null;
}
