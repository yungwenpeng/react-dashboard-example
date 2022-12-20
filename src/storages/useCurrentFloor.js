import { useState } from 'react';

function useCurrentFloor() {
  const getCurrentFloor = () => {
    const floorString = sessionStorage.getItem('floor');
    return floorString
  };
  const [floorId, setCurrentFloor] = useState(getCurrentFloor());

  const saveCurrentFloor = currentFloor => {
    sessionStorage.setItem('floor', currentFloor);
    setCurrentFloor(currentFloor);
  };

  return {
    setCurrentFloor: saveCurrentFloor,
    floorId
  }
}

export default useCurrentFloor;