import {defaultKeymap, indentLess, indentMore} from "@codemirror/commands"
import {acceptCompletion} from "@codemirror/autocomplete"
import {indentUnit} from "@codemirror/language"
import {EditorView, keymap, highlightActiveLine} from "@codemirror/view"
import {highlightActiveLineGutter} from "@codemirror/gutter"
import {EditorState, basicSetup} from "@codemirror/basic-setup"

import {PS2} from "../PS2/index.ts"
import {psLight, psDark, psLightHighlight, psDarkHighlight} from "./styling.js"

const themeExtensions = {
  light: [psLight, psLightHighlight],
  dark: [psDark, psDarkHighlight]
}

//const [theme, setTheme] = useState('dark');
//const container = useRef(null);

const state = EditorState.create({
  doc: `// File handling example
DECLARE LineOfText : STRING
OPENFILE "FileA.txt" FOR READ
OPENFILE "FileB.txt" FOR WRITE
WHILE NOT EOF("FileA.txt") DO
	READFILE "FileA.txt", LineOfText
	IF LineOfText = "" THEN
		WRITEFILE "FileB.txt", "---"
	ELSE
		WRITEFILE "FileB.txt", LineOfText
	ENDIF
ENDWHILE
CLOSEFILE "FileA.txt"
CLOSEFILE "FileB.txt"
`,
  extensions: [
    basicSetup,
    keymap.of([
      ...defaultKeymap,
      {
        key: "Tab",
        preventDefault: true,
        run: acceptCompletion,
      },
      {
        key: "Tab",
        preventDefault: true,
        run: indentMore,
      },
      {
        key: "Shift-Tab",
        preventDefault: true,
        run: indentLess,
      },
      {
        key: "Mod-s",
        preventDefault: true,
        run: () => { document.querySelector("#download-button").click() }
      },      
      {
        key: "Mod-o",
        preventDefault: true,
        run: () => { document.querySelector("#upload").click() }
      }
    ]),
    indentUnit.of("	"),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    psDark,
    psDarkHighlight,
    PS2()
  ]
})

const editor = new EditorView({
  state: state,
  //...themeExtensions[theme],
  parent: document.querySelector("#editor")
})

document.querySelector("#upload").addEventListener('change', (event) => {
	const input = event.target
  if ('files' in input && input.files.length > 0) {
	  readFileContent(input.files[0])
      .then(content => {
  	    const update = editor.state.update({changes: {from: 0, to: editor.state.doc.length, insert: content}})
        editor.update([update])
      }).catch(error => console.log(error))
  }
})

function readFileContent(file) {
	const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}

document.querySelector("#download-button").addEventListener("click", () => {  
  const file = new Blob([editor.state.doc.toString()], {type: "text"});
  if (window.navigator.msSaveOrOpenBlob)
    window.navigator.msSaveOrOpenBlob(file, "myProgram.psc");
  else {
    const a = document.createElement("a")
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = "myProgram.psc";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
    }, 0); 
  }
})