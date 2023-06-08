// http://stackoverflow.com/questions/13440589/retrieve-file-attributes-from-windows-cmd
var activeXFs = new ActiveXObject('Scripting.FileSystemObject');
var wsFileName = WScript.Arguments.item(0);
var fileItem;
var error;

try {
	fileItem = activeXFs.GetFile(wsFileName);
} catch (e) {
	try {
		fileItem = activeXFs.GetFolder(wsFileName);
	} catch (e) {
		error = e.message;
	}
}

WScript.echo(error ? '{"e":"' + error + '"}' : '{"h":' + !!(fileItem.attributes & 2) + '}');
