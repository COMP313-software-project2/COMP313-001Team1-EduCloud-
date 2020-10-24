import React, { Fragment } from 'react'
import { Route, BrowserRouter as Router } from 'react-router-dom'
import PageEventEdit from './PageEventEdit'
import PageEvent from './PageEvent'
import Calendar_ from './calendar'


const Routes = () => (
    <Router>
    
    <Route path='/event' ><PageEvent/></Route>
    <Route render ={() => <PageEventEdit/>} path="/event/:id"/>
   
    </Router>
    
  )
  
  export default Routes
  