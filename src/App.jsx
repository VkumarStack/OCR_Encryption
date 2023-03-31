import { useState, useRef, useEffect } from 'react'
import './App.css'
import { Worker, createWorker } from 'tesseract.js'
import { encrypt, decrypt } from './methods';

function App() {
  const [image, setImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");
  const workerRef = useRef(null);
  const inputRef = useRef(null);

  let x = encrypt("testing test...&a", "keytest");
  console.log(x);
  console.log(decrypt(x, "keytest"));


  useEffect(() => { 
    async function initWorker() {
      workerRef.current = await createWorker();
      await workerRef.current.loadLanguage('eng');
      await workerRef.current.initialize('eng');
      await workerRef.current.setParameters({ tessedit_char_whitelist: 'ABCEDFGHIJKLMNOPQRSTUVWXYZ_' });
    }
    window.addEventListener('paste', (e) => {
      inputRef.current.files = e.clipboardData.files;
      if (e.clipboardData.files.length != 0)
        setImage(URL.createObjectURL(e.clipboardData.files[0]));
    })
    initWorker();
  }, []); 

  useEffect(() => {
    if (image !== null) {
      workerRef.current.recognize(image).then((output) => {
        setRecognizedText(output.data.text);
      })
    }
  }, [image])

  return (
    <div>
      <input type="file" id='image' name='image' accept='image/*' ref={inputRef} onChange={(e) => {
        if (e.target.files.length != 0)
          setImage(URL.createObjectURL(e.target.files[0]));
      }} />
      { (recognizedText !== "") && 
        <p> {recognizedText.replace(/\s/g, '')} </p> }
    </div>
  )
}

export default App
