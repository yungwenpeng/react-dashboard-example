import { useState } from 'react';

function useCurrentPath() {
  const getCurrentPath = () => {
    const pathString = sessionStorage.getItem('path');
    return pathString
  };
  const [path, setCurrentPath] = useState(getCurrentPath());

  const saveCurrentPath = currentPath => {
    sessionStorage.setItem('path', currentPath);
    setCurrentPath(currentPath);
  };

  return {
    setCurrentPath: saveCurrentPath,
    path
  }
}

export default useCurrentPath;