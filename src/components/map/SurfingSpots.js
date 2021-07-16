import { useEffect } from "react";
import L from "leaflet";
import { getSurfingSpots } from "../../api";

export default function SurfingSpots({ map }) {
  //   const layerName = "Spots";
  useEffect(() => {
    if (!map) return;
    const loadSurfingFeatures = async () => {
      try {
        const data = await getSurfingSpots();
        const surfLayer = new L.GeoJSON(data, {
          pointToLayer,
        });
        surfLayer.addTo(map);
      } catch (e) {
        console.log("ERROR", e);
      }
    };
    loadSurfingFeatures();
  }, [map]);
  return null;
}

const pointToLayer = (feature, latlng) => {
  let text = getPopupHtmlContent(feature);
  let mIcon, marker, popup;
  let { visible, enlace } = feature.properties;
  let iconOptions = {
    iconSize: [60, 70],
    shadowSize: [50, 50],
    iconAnchor: [22, 70],
    shadowAnchor: [4, 50],
    popupAnchor: [4, -60],
    iconUrl: "marker.png",
  };
  let popupOptions = {
    closeButton: false,
    className: "custom",
    autoClose: true,
  };

  mIcon = L.icon(iconOptions);
  marker = L.marker(latlng, {
    icon: mIcon,
  });

  if (!isMobileDevice()) {
    marker.on("mouseover", () => {
      marker.openPopup();
    });
    marker.on("click", () => {
      window.open(enlace, "_self");
    });
  }
  popup = marker.bindPopup(
    text,
    visible ? { ...popupOptions, autoClose: false } : popupOptions
  );
  return popup;
};

const isMobileDevice = () =>
  typeof window.orientation !== "undefined" ||
  navigator.userAgent.indexOf("IEMobile") !== -1;

const getPopupHtmlContent = ({ properties: { altura, enlace, nombre } }) =>
  `
    <div class="wave-score">
      <span>${altura} </span>
    </div>
    <div class="wave-link" >
      <a 
      href="${enlace}" >
        ${nombre} 
      </a>
    </div>`;
