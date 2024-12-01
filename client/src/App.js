import './App.css';
import FormComponent from './components/FormComponent';

import ParticlesComponent from './components/particles';

function App() {
  return (
    <div className="App">
      <ParticlesComponent id="particles" />
      <FormComponent />
    </div>
  );
}

export default App;
