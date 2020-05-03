export const basicConverter = <T>(): FirebaseFirestore.FirestoreDataConverter<
  T
> => ({
  toFirestore: (modelObject): T => modelObject,
  fromFirestore: (data): T => data as T,
});
