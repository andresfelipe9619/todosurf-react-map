const POSITION_CLASSES = {
  bottomleft: "leaflet-bottom leaflet-left",
  bottomright: "leaflet-bottom leaflet-right",
  topleft: "leaflet-top leaflet-left",
  topright: "leaflet-top leaflet-right",
  center: "leaflet-bottom leaflet-left center",
};
const stopPropagation = (e) => e.stopPropagation();

const Control = ({ children, position }) => {
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;
  return (
    <div className={positionClass}>
      <div
        className="leaflet-control leaflet-bar"
        onClick={stopPropagation}
        onDrag={stopPropagation}
      >
        {children}
      </div>
    </div>
  );
};

export default Control;
