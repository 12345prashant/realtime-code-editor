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

// ***********************MAIN CODE*********************************



import React, { useEffect, useRef, useState } from 'react';
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


// ***********************MAIN CODE ENDS***************************

// ***********************//////////////////////////////////////**************** */




// ********************BELOW CODE ADDS FEATURE OF COMPILATION******************************************//



// import React, { useEffect, useRef, useState } from 'react';
// import Codemirror from 'codemirror';
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/dracula.css';
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/edit/closebrackets';
// import ACTIONS from '../Actions';
// import { useLocation, useNavigate, Navigate , useParams} from 'react-router-dom'

// const Editor = ({ socketRef, roomId, onCodeChange, isEditOn, ishost, ispersonalEdit ,username}) => {
//     const editorRef = useRef(null);
//     const location = useLocation();
//     const editorInitialized = useRef(false); // Track if editor is already initialized
//     const [output, setOutput] = useState(''); // State to store the output of the compilation
//     const [isRunning, setIsRunning] = useState(false); // State to manage compilation status



//     useEffect(() => {
//         if (!editorInitialized.current) {
//             // Initialize Codemirror only once
//             editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'), {
//                 mode: { name: 'javascript', json: true },
//                 theme: 'dracula',
//                 autoCloseTags: true,
//                 autoCloseBrackets: true,
//                 lineNumbers: true,
//             });

//             editorInitialized.current = true;
                 
//             // Handle local changes
//             editorRef.current.on('change', (instance, changes) => {
//                 const { origin } = changes;
//                 const code = instance.getValue();
//                 onCodeChange(code);

//                 if (origin !== 'setValue') {
//                     socketRef.current.emit(ACTIONS.CODE_CHANGE, {
//                         roomId,
//                         code,
//                     });
//                 }
//             });


            
            
//         }
        
        
//     }, []);

//     useEffect(() => {
//         // Handle remote changes
//         if (socketRef.current) {
//             socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
//                 if (code !== null && editorRef.current) {
//                     editorRef.current.setValue(code);
//                 }
//             });
//         }

//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.off(ACTIONS.CODE_CHANGE);
//             }
//         };
//     }, [socketRef.current]);

//     // Dynamically enable or disable editing
//     useEffect(() => {
//         if (editorRef.current && !ishost) {
//             const isReadOnly = !(isEditOn || ispersonalEdit); // Read-only if both are false
//             // editorRef.current.setOption('readOnly', isEditOn ? false : 'nocursor'); // nocursor disables interaction
//             editorRef.current.setOption('readOnly', isReadOnly ? 'nocursor' : false); // 'nocursor' disables interaction
//         }
//     }, [isEditOn, ispersonalEdit]);




//     const handleCompile = () => {
//         setIsRunning(true);
//         const code = editorRef.current.getValue();
    
//         try {
//             let capturedOutput = []; // Array to capture console.log outputs
    
//             // Override console.log
//             const originalConsoleLog = console.log;
//             console.log = (...args) => {
//                 capturedOutput.push(args.join(' ')); // Join arguments and store them
//                 originalConsoleLog(...args); // Still log to the actual console
//             };
    
//             // Execute the code
//             const result = eval(code);
    
//             // Add result to output if not undefined
//             if (result !== undefined) {
//                 capturedOutput.push(result.toString());
//             }
    
//             // Reset console.log back to its original state
//             console.log = originalConsoleLog;
    
//             setOutput(capturedOutput.join('\n')); // Show all captured output
//         } catch (error) {
//             setOutput('Error during execution: ' + error.message);
//         } finally {
//             setIsRunning(false);
//         }
//     };

//     // return <textarea id="realtimeEditor"></textarea>;
//     return (
//         <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//             <textarea id="realtimeEditor"></textarea>
//             <button onClick={handleCompile} disabled={isRunning} style={{ marginTop: '10px' }}>
//                 {isRunning ? 'Running...' : 'Compile Code'}
//             </button>
//             <div
//                 style={{
//                     marginTop: '10px',
//                     padding: '10px',
//                     backgroundColor: '#2d2d2d',
//                     color: '#ffffff',
//                     borderRadius: '5px',
//                     overflowY: 'auto',
//                     height: '200px',
//                 }}
//             >
//                 <strong>Output:</strong>
//                 <pre>{output}</pre>
//             </div>
//         </div>
//     );
// };




// export default Editor;



// ********************************COMPILATION VALA CODE ENDS********************************//

// import React, { useEffect, useRef, useState } from 'react';
// import Codemirror from 'codemirror';
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/dracula.css';
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/edit/closebrackets';
// import 'codemirror/addon/selection/mark-selection'; // Add for marking selections
// import ACTIONS from '../Actions';
// import { useLocation, useNavigate, Navigate , useParams} from 'react-router-dom'

// const Editor = ({ socketRef, roomId, onCodeChange, isEditOn, ishost, ispersonalEdit ,username}) => {
//     const editorRef = useRef(null);
//     const location = useLocation();
//     const editorInitialized = useRef(false); // Track if editor is already initialized
//     const [output, setOutput] = useState(''); // State to store the output of the compilation
//     const [isRunning, setIsRunning] = useState(false); // State to manage compilation status
//     const cursorMarkers = useRef({}); // To store cursor markers


//     useEffect(() => {
//         if (!editorInitialized.current) {
//             // Initialize Codemirror only once
//             editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'), {
//                 mode: { name: 'javascript', json: true },
//                 theme: 'dracula',
//                 autoCloseTags: true,
//                 autoCloseBrackets: true,
//                 lineNumbers: true,
//             });

//             editorInitialized.current = true;

//             editorRef.current.on('cursorActivity', () => {
//                 const cursor = editorRef.current.getCursor();
//                 const position = { line: cursor.line, ch: cursor.ch };
        
//                 // Emit cursor position and username
//                 if (socketRef.current) {
//                   socketRef.current.emit('cursor_move', {
//                     roomId,
//                     username: username, // Replace with the actual username
//                     position,
//                   });
//                 }
//               });

//               if (socketRef.current) {
//                 socketRef.current.on('update_cursor', ({ socketId, username, position }) => {
//                   if (cursorMarkers.current[socketId]) {
//                     // Remove old marker
//                     cursorMarkers.current[socketId].clear();
//                   }
        
//                   // Create a new marker
//                   const marker = editorRef.current.markText(
//                     position,
//                     { line: position.line, ch: position.ch + 1 },
//                     {
//                       className: 'cursor-highlight',
//                       title: `${username} is here`,
//                     }
//                   );
        
//                   cursorMarkers.current[socketId] = marker;
//                 });
//               }
                 
//             // Handle local changes
//             editorRef.current.on('change', (instance, changes) => {
//                 const { origin } = changes;
//                 const code = instance.getValue();
//                 onCodeChange(code);

//                 if (origin !== 'setValue') {
//                     socketRef.current.emit(ACTIONS.CODE_CHANGE, {
//                         roomId,
//                         code,
//                     });
//                 }
//             });


            
            
//         }
        
        
//     }, []);

//     useEffect(() => {
//         // Handle remote changes
//         if (socketRef.current) {
//             socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
//                 if (code !== null && editorRef.current) {
//                     editorRef.current.setValue(code);
//                 }
//             });
//         }

//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.off(ACTIONS.CODE_CHANGE);
//             }
//         };
//     }, [socketRef.current]);

//     // Dynamically enable or disable editing
//     useEffect(() => {
//         if (editorRef.current && !ishost) {
//             const isReadOnly = !(isEditOn || ispersonalEdit); // Read-only if both are false
//             // editorRef.current.setOption('readOnly', isEditOn ? false : 'nocursor'); // nocursor disables interaction
//             editorRef.current.setOption('readOnly', isReadOnly ? 'nocursor' : false); // 'nocursor' disables interaction
//         }
//     }, [isEditOn, ispersonalEdit]);




//     const handleCompile = () => {
//         setIsRunning(true);
//         const code = editorRef.current.getValue();
    
//         try {
//             let capturedOutput = []; // Array to capture console.log outputs
    
//             // Override console.log
//             const originalConsoleLog = console.log;
//             console.log = (...args) => {
//                 capturedOutput.push(args.join(' ')); // Join arguments and store them
//                 originalConsoleLog(...args); // Still log to the actual console
//             };
    
//             // Execute the code
//             const result = eval(code);
    
//             // Add result to output if not undefined
//             if (result !== undefined) {
//                 capturedOutput.push(result.toString());
//             }
    
//             // Reset console.log back to its original state
//             console.log = originalConsoleLog;
    
//             setOutput(capturedOutput.join('\n')); // Show all captured output
//         } catch (error) {
//             setOutput('Error during execution: ' + error.message);
//         } finally {
//             setIsRunning(false);
//         }
//     };

//     // return <textarea id="realtimeEditor"></textarea>;
//     return (
//         <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//             <textarea id="realtimeEditor"></textarea>
//             <button onClick={handleCompile} disabled={isRunning} style={{ marginTop: '10px' }}>
//                 {isRunning ? 'Running...' : 'Compile Code'}
//             </button>
//             <div
//                 style={{
//                     marginTop: '10px',
//                     padding: '10px',
//                     backgroundColor: '#2d2d2d',
//                     color: '#ffffff',
//                     borderRadius: '5px',
//                     overflowY: 'auto',
//                     height: '200px',
//                 }}
//             >
//                 <strong>Output:</strong>
//                 <pre>{output}</pre>
//             </div>
//         </div>
//     );
// };




// export default Editor;