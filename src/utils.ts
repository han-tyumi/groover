import { Observable } from 'rxjs';

/**
 * Returns a new observable for document snapshots.
 * @param doc The Firestore document to observe.
 */
export function fromDoc<T>(
  doc: firebase.firestore.DocumentReference<T>,
): Observable<firebase.firestore.DocumentSnapshot<T>> {
  return new Observable((subscriber) => {
    return doc.onSnapshot(
      (snapshot) => {
        subscriber.next(snapshot);
      },
      (error) => {
        subscriber.error(error);
      },
    );
  });
}

/**
 * Simply converts to and from by using the same object, just with the supplied typings.
 */
export const basicConverter = <T>(): FirebaseFirestore.FirestoreDataConverter<
  T
> => ({
  toFirestore: (modelObject): T => modelObject,
  fromFirestore: (data): T => data as T,
});

/**
 * Returns a promise that resolves after the given number of milliseconds.
 * @param ms The number of milliseconds.
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

/**
 * @param targetLength The target length of the resulting string.
 * @param n The number to pad with zeros.
 * @returns The number padded with zeros in order to meet the target length.
 */
export const padNumber = (targetLength: number, n: number): string =>
  n.toString().padStart(targetLength, '0');

/**
 * @param ms The milliseconds to format.
 * @returns The given milliseconds formatted in days, hours, minutes, and seconds.
 */
export const formatMs = (ms: number): string => {
  let time = '';

  const s = padNumber(2, Math.floor((ms / 1000) % 60));
  const m = padNumber(2, Math.floor((ms / (1000 * 60)) % 60));
  const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const d = Math.floor((ms / (1000 * 60 * 60 * 24)) % 365);

  if (d > 0) time += `${d}:`;
  if (h > 0) time += `${padNumber(2, h)}:`;
  time += `${m}:${s}`;

  return time;
};
