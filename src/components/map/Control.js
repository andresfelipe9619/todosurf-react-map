import ReactDOMServer from "react-dom/server";

const POSITION_CLASSES = {
  bottomleft: "leaflet-bottom leaflet-left",
  bottomright: "leaflet-bottom leaflet-right",
  topleft: "leaflet-top leaflet-left",
  topright: "leaflet-top leaflet-right",
  center: "leaflet-top leaflet-left center",
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

export const getControlTitle = (title, Icon) =>
  ReactDOMServer.renderToString(
    <Icon
      size={28}
      style={{ marginRight: 10, marginBottom: -6, marginTop: 4 }}
    />
  ) + title;
export default Control;
