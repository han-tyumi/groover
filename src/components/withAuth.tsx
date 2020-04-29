import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { isEmpty, isLoaded } from 'react-redux-firebase';
import { RootState } from '../rootReducer';

const withAuth = (Component: React.ComponentType): React.FunctionComponent => {
  const PrivateRoute: React.FunctionComponent = (props) => {
    const auth = useSelector((state: RootState) => state.firebase.auth);
    const router = useRouter();

    useEffect(() => {
      if (isLoaded(auth) && isEmpty(auth)) {
        router.push('/');
      }
    });

    return isLoaded(auth) && !isEmpty(auth) ? (
      <Component {...props} />
    ) : (
      <span>AUTHENTICATING...</span>
    );
  };

  return PrivateRoute;
};

export default withAuth;
