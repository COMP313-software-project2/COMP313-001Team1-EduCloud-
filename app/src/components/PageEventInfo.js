import React, { useState, useEffect } from 'react'
import Service from '../service'
import Calendar from './calendar'
import Grid from "@material-ui/core/Grid"
import PageEvent from './PageEvent'
import moment from 'moment'
import Can from "../components/Can"
import { Redirect } from 'react-router-dom'
import PageEventEdit from './PageEventEdit'
import history from './history';




const PageEventInfo = (props) => {
    const [open, setOpen] = useState(0)
    const [auth, setAuth] = useState(false)
    const [ eventData, setEventData ] = useState({
      _id: '',
      title: '',
      start: '',
      end: '',
      info: ''
    })
    const {selectedEventID,store} = props;
    const [back, setBack] = useState(false);

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
            
      const onDelete = () => {
        const service = new Service();
        service.post(`api/event/delete/${selectedEventID}`)
              .then(() => {
                setBack(true);
              }).catch(
                err=>{console.log(err);setBack(false)}
              )
      }
       
      return (
        <div>
          {!back
        ?<div className='c-page-container'>
          <form onSubmit={onUpdate}>
            <legend>Edit your Event</legend>
            <div className="form-group ">
              <label className="control-label " htmlFor="title">
                Title
              </label>
              <input className="form-control" name="title" type="text" value={eventData.title} onChange={onChange} />
            </div>
            <div className="form-group ">
              <label className="control-label " htmlFor="start">
                Start Date
              </label>
              <input className="form-control" name="start" type="text" value={eventData.start} onChange={onChange} />
            </div>
            <div className="form-group ">
              <label className="control-label " htmlFor="end">
                End Date
              </label>
              <input className="form-control" name="end" type="text" value={eventData.end} onChange={onChange} />
              <small className="hint">* End date is exclusive in the date range.</small>
            </div>
            <div className="form-group ">
              <label className="control-label " htmlFor="info">
                Details
              </label>
              <textarea className="form-control" cols={40} name="info" rows={5} value={eventData.info} onChange={onChange} />
            </div>
            <div className="form-group">
              <div>           
                <button className="btn btn-primary" >
                  Save
                </button>
              </div>
            </div>
          </form>
          <Grid container spacing={10}>
        
        <Grid className="d-flex" item form="maincomponent" xs>
       
        <form onSubmit={onDelete}>
          <button className="btn btn-secondary">Delete</button>
        </form>
        
        <form onSubmit={onCancel}>
          <button className="btn btn-secondary">Cancel</button>
        </form>
          </Grid>
         
          </Grid>
        </div>
        : <Calendar store = {store}/>
          }
        </div>
        
      )
    
    }
    
    export default PageEventInfo
    