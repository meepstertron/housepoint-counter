export async function loginUser(credentials: any) {
  const currentdomain = window.location.hostname;
  return fetch(`https://api.${currentdomain}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    });
}
