import { BrowserRouter, Route, Routes } from 'react-router'

import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
// import Lobby from './pages/Lobby'
// import Game from './pages/Game'
import GameFlow from './pages/GameFlow'
import Verify from './pages/Verify'

import ProtectedRoute from 'util/auth';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Main (non-game) pages */}
                <Route path='/' Component={Login} />
                <Route path='/login' Component={Login} />
                <Route path='/signup' Component={Signup} />
                <Route path="/verify" element={<Verify />} />
                
                {/* Protected Routes */}
                <Route path='/dashboard' element={<ProtectedRoute element={<Dashboard />} />} />

                {/* Game pages */}
                <Route path="/game/*" element={<ProtectedRoute element={<GameFlow />} />} />

                {/* 404 */}
                <Route path='/*' Component={NotFound} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
