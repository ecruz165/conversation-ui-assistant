import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <div>
        <h1>Conversation UI Demo App</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
          <p>This is a demo application for testing the Conversation UI Assistant.</p>
        </div>
        <p className="read-the-docs">
          This app demonstrates various UI components that can be automated by the AI assistant.
        </p>
      </div>
    </div>
  );
}

export default App;
