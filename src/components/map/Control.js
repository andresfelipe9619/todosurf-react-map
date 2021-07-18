const POSITION_CLASSES = {
  bottomleft: "leaflet-bottom leaflet-left",
  bottomright: "leaflet-bottom leaflet-right",
  topleft: "leaflet-top leaflet-left",
  topright: "leaflet-top leaflet-right",
};
const stopPropagation = (e) => e.stopPropagation();

const Control = ({ children, position }) => {
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;
  return (
    <div
      className={positionClass}
      onClick={stopPropagation}
      onDrag={stopPropagation}
    >
      <div className="leaflet-control leaflet-bar">{children}</div>
    </div>
  );
};

export default Control;
