import axios from "axios";
import { setupCache } from "axios-cache-adapter";

const SURF_URL = "https://data.todosurf.com/api/v1/spots.php";
const STEP_URL = "https://data.todosurf.com/api/v1/forecast.php";

const cache = setupCache({
  maxAge: 30 * 60 * 1000,
});

const api = axios.create({
  adapter: cache.adapter,
});

export async function getSurfingSpots() {
  const { data } = await api.get(SURF_URL);
  return data;
}

export async function getWindData(step = 0) {
  const { data } = await api.get(`${STEP_URL}?type=wind&step=${step}`);
  return data;
}

export async function getWaveData(step = 0) {
  const { data } = await api.get(`${STEP_URL}?type=wave&step=${step}`);
  return data;
}
