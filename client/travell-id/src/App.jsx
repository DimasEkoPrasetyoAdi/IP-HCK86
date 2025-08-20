import { BrowserRouter, Route, Routes } from "react-router"



function App() {
  

  return (
     <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  </BrowserRouter>
  )
}

export default App
