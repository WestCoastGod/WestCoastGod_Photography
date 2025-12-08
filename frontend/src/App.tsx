import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.tsx";
import Photography from "./pages/Photography.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import HKStargazing from "./pages/HKStargazing";
import MusicToImage from "./pages/MusicToImage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<About />} />
        <Route path="/photography" element={<Photography />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/hk-stargazing" element={<HKStargazing />} />
        <Route path="/music-to-image" element={<MusicToImage />} />
      </Route>
    </Routes>
  );
}

export default App;
