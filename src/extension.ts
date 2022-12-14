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
  let maxCol = 0;
  let minCol = Infinity;
  selections.forEach((selection) => {
    const pos = selection.start;
    const existing = uniqueLines.get(pos.line);
    if (!existing || pos.character < existing.character) uniqueLines.set(pos.line, pos);
    maxCol = Math.max(maxCol, pos.character);
    minCol = Math.min(minCol, pos.character);
  });

  if (uniqueLines.size < 2) return;

  const padding = Array(maxCol - minCol + 1).join(' ');
  Array.from(uniqueLines.values())
    .sort((a, b) => -(a.line - b.line))
    .forEach((pos) => {
      if (maxCol > pos.character) edit.insert(pos, padding.substring(0, maxCol - pos.character));
    });
}
