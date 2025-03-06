import Signup from "./Signup"

function App() {
    return (
        <>
            <div className="hero h-full flex">
                <div className="hero-content w-full text-center m-auto flex-col">
                    <h1 className="text-5xl font-bold flex-row mb-8">Escavalon</h1>
                    <Signup></Signup>
                </div>
            </div>
        </>
    )
}

export default App
