/* 
TODO:
PDF conversion
Styling

*/

import { useState, useRef, useEffect } from 'react'
import './App.css'
import { Worker, createWorker } from 'tesseract.js'
import { encrypt, decrypt } from './methods';
import heic2any from 'heic2any';

function App() {
  const [image, setImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");
  const workerRef = useRef(null);
  const fileSelectRef = useRef(null);
  const inputRef = useRef(null);
  const keyRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => { 
    async function initWorker() {
      workerRef.current = await createWorker();
      await workerRef.current.loadLanguage('eng');
      await workerRef.current.initialize('eng');
      await workerRef.current.setParameters({ tessedit_char_whitelist: 'ABCEDFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_.?! ', preserve_interword_spaces: '1' });
      console.log(workerRef.current)
    }
    window.addEventListener('paste', (e) => {
      fileSelectRef.current.files = e.clipboardData.files;
      if (e.clipboardData.files.length != 0) {
        let image = [];
        for (let i = 0; i < e.clipboardData.files.length; i++)
          image.push(URL.createObjectURL(e.clipboardData.files[i]));
        setImage(image);
      }
    })
    initWorker();
  }, []); 

  useEffect(() => {
    async function recognize() {
      if (image !== null) {
        let output = "";
        for (let i = 0; i < image.length; i++) {
          output += (await workerRef.current.recognize(image[i])).data.text;
        } 
        setRecognizedText(output);
      }
    }
    recognize();
  }, [image])

  return (
    <div className='main'>
      <input type="file" multiple="multiple" id='image' name='image' accept='image/*,.heic' ref={fileSelectRef} onChange={async (e) => {
        if (e.target.files.length != 0) {
          let image = [];
          for (let i = 0; i < e.target.files.length; i++) {
            let blob = e.target.files[i];
            if (blob.name.split('.').pop().toLowerCase() == 'heic')
              blob = await heic2any( {blob} );
            image.push(URL.createObjectURL(blob));
          }
          setImage(image);
        }
      }} />
      <textarea ref={inputRef} name="input" id="input" rows="10" defaultValue={recognizedText.replace(/\n/g, ' ')}></textarea>
      <textarea ref={keyRef} name="key" id="key" rows="2" defaultValue="Secret Key"></textarea>
      <div className="buttons">
        <button onClick={() => {
          outputRef.current.defaultValue = encrypt(inputRef.current.value, keyRef.current.value);
        }}> Cipher </button>
        <button onClick={() => {
          outputRef.current.defaultValue = decrypt(inputRef.current.value, keyRef.current.value);
        }}> Decipher </button>
      </div>
      <textarea ref={outputRef} name="output" id="output" rows="10" readOnly defaultValue={""}></textarea>
    </div>
  )
}

export default App
