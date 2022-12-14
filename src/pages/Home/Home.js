import { useEffect } from 'react';
import * as collections from '../../collections';
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
          <collections.Typography variant="h3">Demo homepage</collections.Typography>
        </div>
      </form>
    </>
  );
}
export default Home;

Home.propTypes = {
  setCurrentPath: PropTypes.func.isRequired
}