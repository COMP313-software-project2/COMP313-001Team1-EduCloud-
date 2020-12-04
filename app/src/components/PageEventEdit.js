import React, { useState, useEffect } from 'react'
import Service from '../service'
import Calendar from './calendar'
import Grid from "@material-ui/core/Grid"
import { Box, ListItem, StepConnector, TextField } from '@material-ui/core'
import PageEventInfo from './PageEventInfo';
import PageEvent from './PageEvent'
import moment from 'moment'
import { Redirect } from 'react-router-dom'



const PageEventEdit = (props) => {
  const [ eventData, setEventData ] = useState({
    _id: '',
    title: '',
    start: '',
    end: '',
    info: ''
  })
  const {selectedEventID,store} = props;
  const [back, setBack] = useState(false);
  const [open, setOpen] = useState(0)
  const [auth, setAuth] = useState(false);


  useEffect(()=>{
      const fetch = async () => {
        console.log("inside pageEventEdit")
        const service = new Service();
        service.get(`api/event/${selectedEventID}`)
            .then((res) => setEventData({
              _id: res.data._id,
              title: res.data.title ,
              start: res.data.start ,
              end: res.data.end ,
              info: res.data.info,
              userId: res.data.userId
            })).catch(err => console.log(err))
      }
      fetch();
  },[]);

  const onChange = (e) => {
    e.persist();
    setEventData({...eventData, [e.target.name]: e.target.value});
  }
  
  const onUpdate = () => {
    const service = new Service();
    service.post(`api/event/${selectedEventID}`,eventData)
          .then((res) => {
            setBack(true);
            console.log(res.data.title);
          })
          .catch(
            err => {console.log(err);setBack(false)}
          )
    
  }
  
  const onCancel = () => {
    
    setOpen(2);
  }

  const handleInfo = (event, e) => {

    
    setOpen(3);
    
  }
 
  var user = store.getCurrentUser();
        if(user!=null){//any signed in user can access calendar
          var userRole=user.role;
  
        }
        else{
          userRole=null;
        }
  if(userRole!=null){

  
  return (
    <div>
      
      
      {!back
    ?<div className='c-page-container'>
      <form onSubmit={onUpdate}>

        <legend>Event Details</legend>
        <div className="form-group ">
          <label className="control-label " htmlFor="title">
            Title
          </label>
          <input className="form-control" name="title" type="text" value={eventData.title} onChange={onChange} disabled={true}/>
        </div>
        <div className="form-group ">
          <label className="control-label " htmlFor="start">
            Start Date
          </label>
          <input className="form-control" name="start" type="text" value={eventData.start} onChange={onChange} disabled={true}/>
        </div>
        <div className="form-group ">
          <label className="control-label " htmlFor="end">
            End Date
          </label>
          <input className="form-control" name="end" type="text" value={eventData.end} onChange={onChange} disabled={true}/>
          <small className="hint">* End date is exclusive in the date range.</small>
        </div>
        <div className="form-group ">
          <label className="control-label " htmlFor="info">
            Details
          </label>
          <textarea className="form-control" cols={40} name="info" rows={5} value={eventData.info} onChange={onChange} disabled={true}/>
        </div>
      </form>
      <Grid container spacing={10}>
    
    <Grid className="d-flex" item form="maincomponent" xs>
    <div className="form-group">
         <div>           
                <button className="btn btn-primary" onClick={handleInfo} >
                  Edit
                </button>
                
         </div>
    </div>
    
    <form onSubmit={onCancel}>
          <button className="btn btn-secondary">Cancel</button>
    </form>
      </Grid>
     
      </Grid>
    </div>
    : <Calendar store = {store}/>
      }
      
      {
      (open == 3 ) &&
      <PageEventInfo selectedEventID = {selectedEventID}  store = {store}/>
      }
      
    </div>
    
    
    
  )
  
}
else{
  return(
    
    
        <Redirect to="/unauthorized"/>
     
    )
}
}

export default PageEventEdit
