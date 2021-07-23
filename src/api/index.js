import axios from "axios";
const SURF_URL = "https://www.todosurf.com/dev/config/classes/mapaGJS.php?country=all";
const STEP_URL = "http://198.245.63.175:88/api/v1/data2.php";
export async function getSurfingSpots() {
  const { data } = await axios.get(SURF_URL);
  return data;
}

export async function getSurfingSteps(step = 0) {
  const { data } = await axios.get(`${STEP_URL}?step=${step}`);
  return data;
}
