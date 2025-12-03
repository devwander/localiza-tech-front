import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tanstack } from "./lib";
import { Router } from "./routes";

function App() {
  return (
    <QueryClientProvider client={tanstack}>
      <BrowserRouter basename="/localiza-tech-front">
        <Router />
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </QueryClientProvider>
  );
}

export default App;
