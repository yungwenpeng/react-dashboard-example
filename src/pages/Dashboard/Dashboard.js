import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom"
import * as collections from '../../collections';
import useToken from '../../storages/useToken';
import jwt_decode from "jwt-decode";
import { api_url } from '../../environment/environment';
import './Dashboard.css'
import { styled } from "@mui/material/styles";
import Card from '@mui/material/Card';

const StyledFrenteCard = styled(Card)({
  backgroundColor: '#2762a1',
  color: 'white',
  textAlign: 'center',
  paddingTop: 10,
  margin: 4,
  marginTop: -8,
  fontSize: 20,
  height: 32,
  width: 250,
  /*"&:hover": { backgroundColor: '#32CD32', color: 'black' }*/
});
const StyledLadoCard = styled(Card)({
  backgroundColor: '#2762a1',
  color: 'white',
  textAlign: 'center',
  padding: 10,
  marginTop: -16,
  marginLeft: 213,
  height: 8,
  width: 9,
  transform: 'translate(53px) rotate(90deg) scale(1.55) skewX(45deg) translate(-28px)',
});

function Dashboard({ setCurrentPath }) {
  const { token } = useToken();
  const [floors, setFloors] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPath('dashboard');
  }, [setCurrentPath]);

  useEffect(() => {
    const getAssetInfos = async () => {
      let decoded = jwt_decode(token);
      let url = decoded['scopes'][0] === 'TENANT_ADMIN' ?
        api_url + 'tenant/assetInfos?pageSize=100&page=0&type=Floor' :
        api_url + 'customer/' + decoded['customerId'] + '/assetInfos?pageSize=100&page=0&type=Floor'
      //console.log('getAssetInfos - url:', url);
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: new Headers({
            'Accept': 'application/json',
            'X-Authorization': 'Bearer ' + token
          })
        });
        if (!response.ok) {
          console.log(`getAssetInfos error: The status is ${response.status}`);
        }
        let assetInfos = await response.json();
        const assetDescending = [...assetInfos.data].sort((a, b) =>
          a['name'] > b['name'] ? -1 : 1,
        );
        console.log('getAssetInfos: ', assetDescending);
        setFloors(assetDescending);
      } catch (err) {
        console.log('getAssetInfos - error:', err.message);
      } finally {
        //console.log('getAssetInfos - finally');
      }
    }
    getAssetInfos();
  }, [token]);

  const entryFloor = (floorId) => () => {
    floorId && navigate("/dashboard/" + floorId);
  };

  return (
    <>
      <form className='dashboard'>
        <collections.Box key='box' sx={{
          backgroundColor: '#2762a1',
          width: 233, height: 13,
          marginLeft: 4.8,
          padding: 1.15,
          paddingBottom: 2,
          marginBottom: 1.5,
          transform: 'skewX(-45deg)',
          textAlign: 'center',
          fontWeight: 'bold',
          color: 'white'
        }}>
          Commercial Building
        </collections.Box>
        {floors?.map((floor) => {
          return (
            <collections.Box
              key={'box_' + floor.name}
              className='andares'
              onClick={entryFloor(floor.id['id'])}
            >
              <StyledFrenteCard key={floor.name} className='frenteCard'>
                {floor.name}
              </StyledFrenteCard>
              <StyledLadoCard key={'lado_' + floor.name} className='ladoCard' />
            </collections.Box>
          )
        })}
      </form>
    </>
  );
}

export default Dashboard;

Dashboard.propTypes = {
  setCurrentPath: PropTypes.func.isRequired
}