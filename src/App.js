import Map from "./components/map/Map";
import "./App.css";
import { Suspense } from "react";

function App() {
  return (
    <Suspense fallback={"loading..."}>
      <div className="App">
        <Map />
      </div>
    </Suspense>
  );
}

export default App;
