"use strict";
import * as vscode from "vscode";

export function activate(this: void, context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerTextEditorCommand("simple-alignment.align", (editor, edit, args) => {
		try {
			run(editor, edit);
		}
		catch (e) {
			console.error(e);
			throw e;
		}
	}));
}

function run(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
	var selections = editor.selections;
	if (selections.length < 2)
		return;

	var uniqueLines: vscode.Position[] = [];
	selections.forEach(selection => {
		var pos = selection.start;
		var index = uniqueLines.findIndex(position => position.line == pos.line);
		if (index < 0)
			uniqueLines.push(pos);
		else if (uniqueLines[index].character > pos.character)
			uniqueLines[index] = pos;
	});

	if (uniqueLines.length < 2)
		return;

	var maxPosition = Math.max(...uniqueLines.map(pos => pos.character));
	uniqueLines
		.sort((a, b) => -(a.line - b.line))
		.forEach(pos => {
			if (maxPosition > pos.character)
				edit.insert(pos, repeatString(" ", maxPosition - pos.character));
		});
}

function repeatString(s: string, n: number) {
	return n <= 0 ? "" : Array(n + 1).join(s);
}
