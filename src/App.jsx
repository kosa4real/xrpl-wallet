import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Main from "./pages/Main";
import ManageAccount from "./pages/ManageAccount";
import ImportAccount from "./pages/ImportAccount";
import GenerateAccount from "./pages/GenerateAccount";
import Send from "./pages/Send";
import { ToastContainer } from "./components/Toast";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/send" element={<Send />} />
          <Route path="/manage-account" element={<ManageAccount />} />
          <Route path="/import-account" element={<ImportAccount />} />
          <Route path="/generate-account" element={<GenerateAccount />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
