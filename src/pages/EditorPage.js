import React, { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import Client from '../components/Client'
import Editor from '../components/editor'
import { useState } from 'react'
import { initSocket } from '../socket'
import ACTIONS from '../Actions'
import { useLocation, useNavigate, Navigate , useParams} from 'react-router-dom'





const EditorPages = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  // location is used to get value of username passed as a prop from Home.js
  const location = useLocation();
  const {roomId} = useParams();
  const reactNavigator= useNavigate();
  
  const [mysocketId, setmysocketId]  = useState();
  
  const [clients, setClients] = useState([])

  const [clientsAskingRequest, setClientsAskingRequest] = useState([])


  // changed code
  const [ishost, setishost] = useState(false);
  const [isediton, setisediton]  = useState(true)

  const [personalEdit, setpersonalEdit] = useState(false);


  function editAccess() {
    const newEditAccess = !isediton; // Toggle the current state
    console.log(newEditAccess)
    setisediton(newEditAccess);
    if(isediton===false){
      setpersonalEdit(false)
    }
   
    // Notify other users about the edit access toggle
    if (socketRef.current) {
        socketRef.current.emit(ACTIONS.TOGGLE_EDIT_ACCESS, {
            roomId,
            isediton: newEditAccess,
        });
    }
}

function requestEditAccess(){
  
//   if (!hostsocketId) {
//     toast.error("Host ID is not available.");
//     return;
// }
if (!mysocketId) {
  toast.error('Your socket ID is not available.');
  return;
}
console.log('Requesting edit access with:', mysocketId);
  socketRef.current.emit(ACTIONS.ASK_EDIT_REQUEST,{
    roomId: roomId, 
    mysocketId: mysocketId,
    username: location.state?.username,
    
    
  })
}

function addClientRequest(socketId, username){
  setClientsAskingRequest((prevClients) => [
    ...prevClients,
    { socketId, username },
]);
}

function grantPersonalRequest(socketId){
  console.log("Sended grant request to server")
  socketRef.current.emit(ACTIONS.GRANT_PERSONAL_REQUEST,{
    socketId
  })

  setClientsAskingRequest((prevClients) =>
    prevClients.filter((client) => client.socketId !== socketId)
);
}

  useEffect(()=>{
    const init = async () =>{

    
      // const timestamp = Date.now();

      if(!socketRef.current){
        // let count = 0;
        socketRef.current = await initSocket();

        // below 2 lines is used to show user the error occured 
        socketRef.current.on('connect_error', (err) => handleErrors(err));
        socketRef.current.on('connect_failed', (err) => handleErrors(err));
  
        function handleErrors(e){
          console.log('soclet error', e);
          toast.error('Socket connection failed, try again later.');
          reactNavigator('/');
        }
        // send this to server 
        
      
          socketRef.current.emit(ACTIONS.JOIN,{
            roomId,
            username: location.state?.username,
            
            
          });
        
          
        
        
        
  
  
        // Listening for joined event
        // will come from server (view server.js)
        socketRef.current.on(
          ACTIONS.JOINED,
          ({clients, username, socketId}) => {
            // we do not want to notify user that has joined 
            if (username === location.state?.username) {
              setmysocketId(socketId); // Correctly setting the socketId for the current user
            }
            if(username !== location.state?.username){
              toast.success(`${username} joined the room.`)
              console.log(`${username} joined`)
              
            }
            setClients(clients);
            // below line will ensure that suppose a new user has joined so he should not see empty screen
            socketRef.current.emit(ACTIONS.SYNC_CODE,{
              code: codeRef.current,
              socketId,
            });
            // if current user is not a host , than the edit request for him will be blocked 
            if(!ishost){
              socketRef.current.emit(ACTIONS.TOGGLE_EDIT_ACCESS, {
                roomId,
                isediton: !isediton
            });
            
            }
            
            

          }
        );
  
  
        // Listning for disconnected
        socketRef.current.on(ACTIONS.DISCONNECTED,({socketId, username})=>{
          toast.success(`${username} left the room.`);
          setClients((prev)=>{
            return prev.filter(client=>client.socketId!==socketId)
          })
        })



        if (socketRef.current) {
          socketRef.current.on(ACTIONS.TOGGLE_EDIT_ACCESS, ({ isediton }) => {

              if (!isediton && personalEdit === true) {
            setpersonalEdit((prev) => {
                // Update the state only when it's true
                if (prev) {
                    toast.success('Host blocked edit access');
                    return false;
                }
                return prev; // Return the same value if not true
            });
        }
        setisediton(isediton); // Update edit access for all users
    });
      }

        // Show host user
        socketRef.current.on(ACTIONS.HOST_USER, ({ socketId }) => {
          setishost(true);
          
          console.log(`Host socket ID received: ${socketId}`);
      });


        // host will get the a request if a user asks for personal request
        socketRef.current.on(ACTIONS.ASK_EDIT_REQUEST,({mysocketId, username})=>{
          // console.log("yes got it")
          addClientRequest(mysocketId, username);
          console.log(`request from ${mysocketId}`)
          toast.success(`${username} asking for edit request`)

        })

        
        // client got edit request
       socketRef.current.on(ACTIONS.GRANT_PERSONAL_REQUEST,({socketId})=>{
        console.log("i AM CLIENT GOT EDIT REQUEST")
          setpersonalEdit(true);
          toast.success("You can now edit")
       })
      }
      

    };
    init();
    

    return ()=>{
      if(socketRef.current){
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.TOGGLE_EDIT_ACCESS);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
      // socketRef.current = null;
      }
      
    }


  }, []);
  useEffect(() => {
    if (!isediton && personalEdit === true) {
        toast.success('Host blocked edit access');
        setpersonalEdit(false); // Make sure edit access is blocked properly
    }
}, [isediton]);

  async function copyRoomId(){
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to your clipboard');
    }catch(err){
      toast.error('Could not copy room id')
      console.error(err);
    }
  }

  function leaveRoom(){
    reactNavigator('/');
  }
  // if username is not passed as prop redirect to home page
  if(!location.state){
    return  <Navigate to="/" />;
  }

  

  return (
    <div className='mainWrap'>
      {/* sidebar code */}
      <div className='aside'>

        <div className='asideInner'>

          <div className='logo'>

            <img className='logoImage'
                src='/code-sync.png'
                alt="logo"
            ></img>
          </div>
          <h3>Connected</h3>
          {ishost && <h3>You are the host</h3>}
          {ishost && isediton && <button onClick={editAccess}>Stop edit access from all</button>}
          {ishost && !isediton && <button onClick={editAccess}>Grant edit access to all</button>}


          {!ishost && !isediton && !personalEdit && <button onClick={requestEditAccess}>Request Edit access</button>}

          
          
          {/* For clients name in sidebar , another component is created */}
          <div className='clientsList'>
            {
              clients.map((client) => 
              (
                <Client 
                key={client.socketId} 
                username={client.username}/>)
            )}

          </div>
        </div>
        
        {
          ishost && 
          <div className='editRequests'>
            <h3>Edit Requests</h3>
            <ul>
              {clientsAskingRequest.map((client, index) => (
                <li key={index}>{`${client.username} asked for edit request`}
                {<button onClick={() => grantPersonalRequest(client.socketId)}>Grant edit request</button>}</li>
              ))}
            </ul>
        </div>
        }
        

        <button className='btn copyBtn' onClick={copyRoomId}>Copy ROOM ID</button>
        <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>
        

      </div>


      {/* Right side code editor  */}
      <div className='editorWrap'>
        
        <Editor
    socketRef={socketRef}
    roomId={roomId}
    onCodeChange={(code) => {
        codeRef.current = code;
    }}
    isEditOn={isediton}
    ishost={ishost}
    ispersonalEdit = {personalEdit}
    // What does onCodeChange do?
        // The issue is that when the new user joins he will see a empty code editor ,
        // the actual code is present in editor.js, 
        // so to get code here we will pass a function to the editor.js as a prop and the code changed their will be passed back to EditorPage.js
/>

      </div>
    </div> 
  )
}

export default EditorPages


