import { BrowserRouter, Routes, Route } from "react-router-dom";

import CataloguePage from "./pages/CataloguePage";
import AddJewelleryPage from "./pages/AddJewelleryPage";
import ManagementPage from "./pages/ManagementPage";
import ManageJewelleryPage from "./pages/ManageJewelleryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main catalogue */}
        <Route path="/" element={<CataloguePage />} />

        <Route path="/catalogue" element={<CataloguePage />} />

        {/* Management */}
        <Route path="/management" element={<ManagementPage />} />

        {/* Manage existing jewellery */}
        <Route path="/manage-jewellery" element={<ManageJewelleryPage />} />

        {/* Add jewellery */}
        <Route path="/add-jewellery" element={<AddJewelleryPage />} />

        {/* Unknown routes */}
        <Route path="*" element={<CataloguePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
