export const production = false; // set it to true when deploy to the server

const domain = production ? '139.59.227.127' : '127.0.0.1:3001'; // if you have domain pointed to digitalOcean Cloud server let use your domain.eg: tabvn.com
//ip address'139.59.227.127' :'ws://localhost:3001';
export const websocketUrl = `ws://${domain}`
export const apiUrl = `http://${domain}`