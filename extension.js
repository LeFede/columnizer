const vscode = require('vscode');



/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// console.log('Congratulations, your extension "columnize" is now active!');

	let disposable = vscode.commands.registerCommand('columnizer.columnize', function () {

    // const selectedText = editor?.document.getText(editor.selection)
    // console.log(selectedText)
    
    const editor = vscode.window.activeTextEditor
    const filePath = vscode.window.activeTextEditor.document.uri.path
    const fileExtension = filePath.split('.').at(-1)

    // const lineEnd = fileExtension === 'js' ? ',' : ';'
    
    if (editor) {
      
      const document = editor.document
      editor.edit((editBuilder) => {
        editor.selections.forEach(sel => {
          const range = sel.isEmpty ? document.getWordRangeAtPosition(sel.start) || sel : sel;
          let word = document.getText(range);
          let final = ''
          
          const matches = [...word.matchAll(/(?<indent>^[^\n]\s{1,})?(?<left>[^\s].*)(?<sign>[:=])(?=[ \s])(?<right>.*)/gm)]

          const o = matches.reduce((obj, {groups}) => {

            const left = groups.left.trim() 
            const sign = groups.sign
            const right = groups.right.trim()
            const indent = groups.indent?.length
            
            return {
              width: left.length > obj.width ? left.length : obj.width,
              indent: indent > obj.indent ? indent : obj.indent,
              lines: [
                ...obj.lines,
                {
                  left,sign,right
                }
              ]
            }
          }, {indent: 0, width: 0, lines: []})

          final = o.lines.reduce((str, line) => {
            const firstBreak = str.length > 0 ? '\n' : ''
            const { indent, width } = o
            const { left, sign, right } = line
            const ind = ' '.repeat(indent)
            const space = ' '.repeat(width - left.length)
            return `${str}${firstBreak}${ind}${left}${space} ${sign} ${right}`
          }, '')

          editBuilder.replace(range, final)
        })
      })
    }

	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

const getSelections = (editBuilder) => {

}

module.exports = {
	activate,
	deactivate
}
