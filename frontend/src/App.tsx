import { useEffect, useState } from 'react'
import './App.css'
import api from './configs/api.config'

function App() {
  const [welcomeMsg, setWelcomeMsg] = useState("")

  useEffect(() => {
    const fetchWelcome = async () => {
      const res = await api.get("/");
      setWelcomeMsg(res.data.message);
    };
    
    fetchWelcome();
  }, []);

  return (
    <>
      <section id="center">
        <div>
          {welcomeMsg &&<p>{welcomeMsg}</p>}
        </div>
      </section>
    </>
  )
}

export default App
