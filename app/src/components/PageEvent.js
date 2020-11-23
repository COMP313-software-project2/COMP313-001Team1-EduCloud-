import React, { useState } from 'react';
import Calendar from './calendar';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

const PageEvent = (props) => {
  const [ eventData, setEventData ] = useState({
    _id: '',
    title: '',
    start: '',
    end: '',
    info: ''
  });

  const [back, setBack] = useState(false);
  //const {date, setDate} = props;
  const {store} = props;
  //const apiUrl = "http://localhost:3000/api/events";
  
  const cancel = () => {
    setBack(true);
  }
  const createEvent = (e) => {
      //add event function here
        e.preventDefault();
        const user = store.getCurrentUser();
        const userId = user._id;
        const data = {title: eventData.title, start: eventData.start, end: eventData.end, info: eventData.info, userId: userId}
        store.addEvent(data).then((res) => {
          setBack(true);
          console.log("successfully addd.")
        }).catch((err) => {
          setBack(false);
          console.log("err during creating event in react file : " + err)
        })
      
  };
  const onChange = (e)=> {
      e.persist();
      setEventData({...eventData, [e.target.name]: e.target.value});
  };


  return (
      <div>
    {!back
    ?<div className='c-page-container'>
      <form onSubmit={createEvent}>
        <legend>Event Details</legend>
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
          <br/>
          <DatePicker
            className="form-control"
            dateFormat="DD-MM-YYYY, h:mm:ss a"
            selected={eventData.start}
            onChange={date => setEventData({...eventData,start: date})}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
          />
        </div>
        <div className="form-group ">
          <label className="control-label " htmlFor="end">
            End Date
          </label>
          <br/>
          <DatePicker
            className="form-control"
            selected={eventData.end}
            onChange={date => setEventData({...eventData,end: date})}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
          />
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
      <button className="btn btn-secondary" onClick={cancel}>Cancel</button>
    </div>
    : <Calendar store={store}/>
    }
    </div>
  )
}

export default PageEvent
