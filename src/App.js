import React, { useState } from "react";
import AllLists from "./AllLists";
import "./App.css";

function App() {
const [setIsCreatingList] = useState(false);
return (

    <div className="app">
        <AllLists onCreateList={() => setIsCreatingList(true)} />
    </div>
);
}
export default App;