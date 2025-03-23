import axios from 'axios'

export async function getCountryFromIP(): Promise<string> {
  try {
    const response = await axios.get('https://ipapi.co/json/')
    return response.data.country_name
  } catch (error) {
    console.error('Error getting country from IP:', error)
    return 'Unknown' // Fallback value if IP geolocation fails
  }
}