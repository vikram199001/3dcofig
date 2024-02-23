import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Home from './Components/Home';


const RouterIndex = () => {
    const RenderComponent = ({children}) => {
        return <div className='app'>
            <Header/>
            <div className='row m-0'>
                {children}
            </div>
            <Footer/>
        </div>
    }

        
    // return <Router basename='/360sofa/'>

return <Router>     
  <Routes>
            <Route path="/"  element={<RenderComponent><Home/></RenderComponent>} />
        </Routes>
    </Router>
}

export default RouterIndex;