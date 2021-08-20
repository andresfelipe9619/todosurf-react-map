import L from "leaflet";
const TILE_LAYER =
  "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
// "https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png";
const TILE_LAYER_CONFIG = {
  attribution: "©OpenStreetMap, ©CartoDB",
};
const LABELS_LAYER =
  "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png";

const BOUNDS = new L.LatLngBounds(
  new L.LatLng(-25.35452, -80.242609),
  new L.LatLng(70.836104, 25.921826)
);
const VISCOSITY = 0.1;
const MAX_ZOOM_MAP = 12;
const INITIAL_ZOOM = 4;
const MAP_OPTIONS = {
  zoom: INITIAL_ZOOM,
  center: BOUNDS.getCenter(),
  minZoom: INITIAL_ZOOM - 1,
  maxZoom: MAX_ZOOM_MAP,
  preferCanvas: true,
  maxBoundsViscosity: VISCOSITY,
};

const WHITE_SMOKE = "#eee";
const SECONDARY = "#ffc50b";
const PRIMARY = "#f5821f";
const MAX_STEP = 16;
const INITIAL_STEP = 0;
const DAY_SECTIONS = 4;
const HALF_STEP = Math.floor(MAX_STEP / 2);
const STEPS = [...Array(MAX_STEP)].map((_, i) => ++i);

export {
  TILE_LAYER,
  LABELS_LAYER,
  TILE_LAYER_CONFIG,
  MAX_ZOOM_MAP,
  WHITE_SMOKE,
  SECONDARY,
  PRIMARY,
  MAX_STEP,
  DAY_SECTIONS,
  INITIAL_STEP,
  HALF_STEP,
  STEPS,
};
export default MAP_OPTIONS;
