import { useEffect } from 'react';
import { Typography } from "@material-ui/core";
import PropTypes from 'prop-types';
import './Home.css';

function Home({ setCurrentPath }) {

  useEffect(() => {
    setCurrentPath('home');
  }, [setCurrentPath]);

  return (
    <>
      <form className='home'>
        <div>
          <Typography variant="h3">Demo homepage</Typography>
        </div>
      </form>
    </>
  );
}
export default Home;

Home.propTypes = {
  setCurrentPath: PropTypes.func.isRequired
}