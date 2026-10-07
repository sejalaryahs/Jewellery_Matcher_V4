import { BrowserRouter, Routes, Route } from "react-router-dom";

import CataloguePage from "./pages/CataloguePage";
import SearchPage from "./pages/SearchPage";
import AddJewelleryPage from "./pages/AddJewelleryPage";
import ManagementPage from "./pages/ManagementPage";
import ManageJewelleryPage from "./pages/ManageJewelleryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CataloguePage />} />

        <Route path="/catalogue" element={<CataloguePage />} />

        <Route path="/search" element={<SearchPage />} />

        <Route path="/management" element={<ManagementPage />} />

        <Route path="/manage-jewellery" element={<ManageJewelleryPage />} />

        <Route path="/add-jewellery" element={<AddJewelleryPage />} />

        <Route path="*" element={<CataloguePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
