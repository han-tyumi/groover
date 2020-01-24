import { Button } from '@material-ui/core';
import { NextPage } from 'next';

const Index: NextPage = () => {
  return <Button href="/api/authorize">Authorize</Button>;
};

export default Index;
