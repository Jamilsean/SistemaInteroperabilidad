import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
 
function App() {
  return   <>
     <AppRoutes />
     <Toaster position="top-center" richColors /> {/* visible en login */}
  </>;
}

export default App;