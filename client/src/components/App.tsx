import { BrowserRouter, Route, Routes } from 'react-router'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'
import Lobby from './pages/Lobby'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Main (non-game) pages */}
                <Route path='/' Component={Signup} />
                <Route path='/signup' Component={Signup} />
                <Route path='/login' Component={Login} />
                <Route path="/lobby/*" Component={Lobby} />

                {/* 404 */}
                <Route path='/*' Component={NotFound} />
            </Routes>
        </BrowserRouter>
        // <>
        //     <div className="hero h-full flex">
        //         <div className="hero-content w-full text-center m-auto flex-col">
        //             <h1 className="text-5xl font-bold flex-row mb-8">Escavalon</h1>
        //             <Signup></Signup>
        //         </div>
        //     </div>
        // </>
    )
}

export default App
