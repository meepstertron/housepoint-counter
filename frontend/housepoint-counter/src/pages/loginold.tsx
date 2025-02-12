import { useState } from 'react';
import PropTypes from 'prop-types';
import { loginUser } from '../services/auth'; // Move loginUser to a separate service file

export default function Login({ setToken }: { setToken: any }) {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      const token = await loginUser({
        username,
        password
      });
      setToken(token);
    } catch (err) {
      setError('Invalid username or password');
    }
  }

  return(
    <div className="login-wrapper">
      <h1>Please Log In</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" onChange={e => setUserName(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input type="password" onChange={e => setPassword(e.target.value)} />
        </label>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
};