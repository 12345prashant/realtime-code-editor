// const { Socket } = require('dgram');
const express = require('express');
const app= express();
const http = require('http');
const {Server} = require('socket.io');
const ACTIONS = require('./src/Actions');
const path = require('path');


const server = http.createServer(app);

// 1 change , also change .env or view package.json
const io = new Server(server);

// const io = new Server(server, {
//     cors: {
//       origin: "https://realtime-code-editor-6gx61n2ba.vercel.app/", // Replace with your Vercel frontend URL
//       methods: ["GET", "POST"],
//       allowedHeaders: ["my-custom-header"],
//       credentials: true,
//     },
//   });



// ********* DEPLOYMENT PURPOSE
app.use(express.static('build'));
app.use((req, res, next)=>{
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
// ********
// Created a map where we store which socket id corresponds to which username
const userSocketMap = {};
const roomHosts = {}; // Map of roomId to host socket ID


function getAllConnectedClients(roomId){
    // io.sockets.adapter.rooms return all the  rooms 
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId)=>{
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    )
}


io.on('connection', (socket)=>{
    console.log('socket connected', socket.id);

    // roomid, username are paased from ACTIONS.JOIN in EditorPage.js
    socket.on(ACTIONS.JOIN, ({roomId, username})=>{
       
        if(!userSocketMap[socket.id]){
            userSocketMap[socket.id] = username;
            // join current socketid to given room id
            // if no room is there , it will create a new room
            socket.join(roomId);
            
            const clients = getAllConnectedClients(roomId);
// ****
            // Assign host if this is the first client
        if (!roomHosts[roomId]) {
            roomHosts[roomId] = socket.id;
            io.to(socket.id).emit(ACTIONS.HOST_USER, {
                host_user: "host",
                socketId: socket.id,
            });
        }


        // *******

        




            console.log(`User joined: ${username}, Socket ID: ${socket.id}, Room ID: ${roomId}`);
            console.log('Current clients:', clients);
            // console.log(clients);
    
            // when an client join we need to notify other clients
            // when a client joins , we send a message to other clients in the same room about total clients, username of client that joined and socketid pf client that joined
    
            clients.forEach(({socketId})=>{
                io.to(socketId).emit(ACTIONS.JOINED,{
                    clients,
                    username,
                    socketId: socket.id,
                })
            })

            
        }
        

    });


    // server will send the updated code to each socket of roomid
    socket.on(ACTIONS.CODE_CHANGE,({roomId,code})=>{

        // io.to(roomId).emit(ACTIONS.CODE_CHANGE,{code});
        // Above line will cause a isue because it will send the same code to person who is writing that also , but we neeed to send the change part only to other people
        // below line will ensure that only the person other from who is writing will get updated code
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{code});
    })

    socket.on(ACTIONS.SYNC_CODE,({socketId,code})=>{
        // console.log("got form client")
        io.to(socketId).emit(ACTIONS.CODE_CHANGE,{code});
       
        
    })

    socket.on(ACTIONS.TOGGLE_EDIT_ACCESS, ({ roomId, isediton }) => {
        io.to(roomId).emit(ACTIONS.TOGGLE_EDIT_ACCESS, { isediton });
      });
      



    //   when a user ask for edit request

    socket.on(ACTIONS.ASK_EDIT_REQUEST, ({roomId, mysocketId, username})=>{
        // console.log(room_host_id)
        console.log(roomHosts[roomId])
        console.log(mysocketId)
        io.to(roomHosts[roomId]).emit(ACTIONS.ASK_EDIT_REQUEST, {mysocketId, username})
    })

    socket.on(ACTIONS.GRANT_PERSONAL_REQUEST,({socketId})=>{
        if (io.sockets.sockets.get(socketId)) {
            io.to(socketId).emit(ACTIONS.GRANT_PERSONAL_REQUEST, { socketId });
          } else {
            console.error("Invalid socketId:", socketId);
          }
    })

    socket.on('cursor_move', ({ roomId, socketId, username, position }) => {
        socket.to(roomId).emit('update_cursor', { socketId, username, position });
      });

      
    socket.on('disconnecting', ()=>{
        // finding all the rooms in which current socket is connected
        const rooms = [...socket.rooms];
        rooms.forEach((roomId)=>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });

   
    
});

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=> console.log(`Listening on port ${PORT}`))