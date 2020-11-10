import React from 'react'
import ChatBot from 'react-simple-chatbot'


function CustomChatbot(props) {

 const config = {
   width: "300px",
   height: "400px",
   floating: true
 };

 const steps = [
   {
       id: '1',
       message: 'What is your name?',
       trigger: '2',
     },
     {
       id: '2',
       user: true,
       trigger: '3',
     },
     {
       id: '3',
       message: 'Hi {previousValue}, nice to meet you!',
       trigger: '4',
     },

     {
       id: '4',
       message: 'How can I help you?',
       trigger: '5',
     },
     {
        id: '5',
       options: [
    { value: 1, label: 'Log in/Sign up', trigger: '6' },
    { value: 2, label: 'About us', trigger: '7' },
    { value: 3, label: 'Contact us', trigger: '8' },
       ],
     },
     {
       id: '6',
      message: 'Please input your name, valid email, valid phone number, password.',
       end: true,
     },
     {
       id: '7',
       message: 'EduCloud is the web application for college students to communicate each other and schedule',
       end: true,
     },
     {
       id: '8',
       message: 'Please email to educloud@gmail.com',
       end: true,
     },
  ];

 return <ChatBot steps={steps} {...config} />;




}




export default CustomChatbot;

