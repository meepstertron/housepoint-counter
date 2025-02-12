import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    const tokenString = localStorage.getItem('token');
    if (!tokenString) return null;
    try {
      const userToken = JSON.parse(tokenString);
      return userToken?.token;
    } catch (e) {
      console.error('Error parsing token from localStorage', e);
      return null;
    }
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userToken: any) => {
    console.log('Saving token:', userToken);
    localStorage.setItem('token', JSON.stringify(userToken));
    setToken(userToken.token);
  };

  const resetToken = () => {
    console.log('Resetting token');
    setToken(undefined);
    localStorage.removeItem("token");
  };

  return {
    setToken: saveToken,
    resetToken,
    token
  };
}