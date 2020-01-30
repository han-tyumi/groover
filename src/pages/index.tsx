import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardHeader,
  CircularProgress
} from '@material-ui/core';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';

import firebaseApp from '../client/firebase';

const Index: NextPage = () => {
  const [user, setUser] = useState<firebase.User | null | undefined>();

  useEffect(() => {
    const sub = firebaseApp.auth().onAuthStateChanged(u => setUser(u));
    return () => sub();
  }, []);

  function openLogin() {
    window.open('/api/login', 'login', 'height=585,width=400');
  }

  return (
    <Card>
      {user ? (
        <CardHeader
          avatar={
            <Avatar
              alt={user.displayName || undefined}
              src={user.photoURL || undefined}
            />
          }
          title={user.displayName}
        />
      ) : (
        <CardActions>
          {user === null ? (
            <Button onClick={openLogin}>Login</Button>
          ) : (
            <CircularProgress />
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default Index;
