import { useState } from 'react';
function App() {
return (
<div>
<h1>Hello from React + Vite!</h1>
<WelcomeMessage name="Alice" />
<hr />
<Counter />
</div>
);
}
function WelcomeMessage({ name }) {
    return <p>Welcome, {name}!</p>;
    }

    function Counter() {
        const [count, setCount] = useState(0);
        return (
        <div>
        <p>You clicked {count} times.</p>
        <button onClick={() => setCount(count + 1)}>
        Increment
        </button>
        </div>
        );
        }
        export default App;
        