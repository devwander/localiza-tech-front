import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { tanstack } from "./lib";
import { Router } from "./routes";

function App() {
  return (
    <QueryClientProvider client={tanstack}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
