import vscode from 'vscode';

export function activate(this: void, context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('simple-alignment.align', (editor, edit, args) => {
      try {
        run(editor, edit);
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
  );
}

function run(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
  const selections = editor.selections;
  if (selections.length < 2) return;

  const uniqueLines = new Map<number, vscode.Position>();
  selections.forEach((selection) => {
    const pos = selection.start;
    const existing = uniqueLines.get(pos.line);
    if (!existing || pos.character < existing.character) uniqueLines.set(pos.line, pos);
  });

  if (uniqueLines.size < 2) return;

  // Convert character position → column number to account for tabs
  // (https://github.com/earshinov/vscode-simple-alignment/issues/2)
  const tabSize = editor.options.tabSize as number;
  let maxCol = 0;
  let minCol = Infinity;
  const values = Array.from(uniqueLines.values()).map((pos) => {
    const col = tabSize === 1 || pos.character === 0 ? pos.character : columnFromCharacter(editor, pos, tabSize);
    maxCol = Math.max(maxCol, col);
    minCol = Math.min(minCol, col);
    return new vscode.Position(pos.line, col);
  });

  const padding = Array(maxCol - minCol + 1).join(' ');
  values
    .sort((a, b) => -(a.line - b.line))
    .forEach((pos) => {
      if (maxCol > pos.character) edit.insert(pos, padding.substring(0, maxCol - pos.character));
    });
}

function columnFromCharacter(editor: vscode.TextEditor, pos: vscode.Position, tabSize: number): number {
  const text = editor.document.getText(new vscode.Range(new vscode.Position(pos.line, 0), pos));

  let d = 0;
  for (let i = 0; (i = text.indexOf('\t', i)) >= 0; ++i) {
    // how many characters are left to the next tab stop?
    d += tabSize - ((i + d) % tabSize) - 1;
  }
  return pos.character + d;
}
