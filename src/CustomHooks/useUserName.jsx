const apiUrl = import.meta.env.VITE_API_URL;

export const fetchUserName = async (userId, database, token) => {
  try {
    if (!userId) return '';

    const response = await fetch(`${apiUrl}/Users/${userId}?WhichDatabase=${database}`,{
      headers:{
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return `${data.firstName} ${data.lastName}`;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return '';
  }
};
