// import React, {useEffect, useRef, useState} from 'react'
// import Codemirror from 'codemirror'
// import 'codemirror/lib/codemirror.css'
// // below line is used to get theme for code (background css)
// import 'codemirror/theme/dracula.css'
// // below line will import utilities for javascript 
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/edit/closebrackets';
// import ACTIONS from '../Actions';



// const Editor = ({socketRef, roomId, onCodeChange}) => {

//   const editorRef = useRef(null); 
//   const [isEditable, setIsEditable] = useState(true);
//   useEffect(()=>{
//     async function init(){

//         // below line depicts that for the text area with id : 'realtimeEditor' , enable codemirror in that text area and language is JS woth dracula theme
//         editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'),{
//             mode: {name: 'javascript', json: true},
//             theme: 'dracula',
//             autoCloseTags: true,
//             autoCloseBrackets: true,
//             lineNumbers: true,
//             readOnly: isEditable ? false : 'nocursor', // Control read-only mode
//         });
        

      


//         // when i make changes in code
//         // editorRef.current.on('change') , keeps track of each and every actvivity of user in code mirror
//         editorRef.current.on('change', (instance, changes)=>{
//           // console.log('changes', changes);
//           const {origin} = changes;
//           // instance.getValue(); will get all the text inside textarea
//           const code = instance.getValue();
//           // passing to editotPage.js , for code syncing process
//           onCodeChange(code);
//           if(origin!=='setValue'  && isEditable){
//             // send to server
//             socketRef.current.emit(ACTIONS.CODE_CHANGE,{
//               roomId,
//               code,
//             });
//           }
//           console.log(code);
//         })
      


//     }
//     init();

//   }, [isEditable]);


//   useEffect(()=>{
//       // when some other person makes changes
//       // this is coming from server
//       if(socketRef.current){
//         socketRef.current.on(ACTIONS.CODE_CHANGE,({code})=>{
//           if(code!==null){
//             editorRef.current.setValue(code);
//           }
//         });


//         socketRef.current.on(ACTIONS.TOGGLE_EDIT_ACCESS, ({ isediton }) => {
//           setIsEditable(isediton);
//         });
//       }

//       return () => {
//         if(socketRef.current){
//           socketRef.current.off(ACTIONS.CODE_CHANGE);
//           socketRef.current.off(ACTIONS.TOGGLE_EDIT_ACCESS);
//         }
        
//     };
      
//   },[socketRef.current])


//   return (
//     <textarea id="realtimeEditor"></textarea>
//   )
// }

// export default Editor


import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';
import { useLocation, useNavigate, Navigate , useParams} from 'react-router-dom'

const Editor = ({ socketRef, roomId, onCodeChange, isEditOn, ishost, ispersonalEdit }) => {
    const editorRef = useRef(null);
    const location = useLocation();
    const editorInitialized = useRef(false); // Track if editor is already initialized

    useEffect(() => {
        if (!editorInitialized.current) {
            // Initialize Codemirror only once
            editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'), {
                mode: { name: 'javascript', json: true },
                theme: 'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true,
            });

            editorInitialized.current = true;
                 
            // Handle local changes
            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);

                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });


            
            
        }
        
        
    }, []);

    useEffect(() => {
        // Handle remote changes
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null && editorRef.current) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off(ACTIONS.CODE_CHANGE);
            }
        };
    }, [socketRef.current]);

    // Dynamically enable or disable editing
    useEffect(() => {
        if (editorRef.current && !ishost) {
            const isReadOnly = !(isEditOn || ispersonalEdit); // Read-only if both are false
            // editorRef.current.setOption('readOnly', isEditOn ? false : 'nocursor'); // nocursor disables interaction
            editorRef.current.setOption('readOnly', isReadOnly ? 'nocursor' : false); // 'nocursor' disables interaction
        }
    }, [isEditOn, ispersonalEdit]);

    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
