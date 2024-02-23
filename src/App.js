
import { Provider } from "react-redux";
import './App.scss';
import RouterIndex from '../src/router';
import 'bootstrap/dist/css/bootstrap.min.css';
import store from "./redux/store"

function App() {
  return (
    <div className="App">
        <Provider store={store}>
          <RouterIndex/>
        </Provider>
    </div>
  );
}

export default App;
