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
