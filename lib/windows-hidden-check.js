// http://stackoverflow.com/questions/13440589/retrieve-file-attributes-from-windows-cmd
var activeXFs = new ActiveXObject('Scripting.FileSystemObject');
var wsFileName = WScript.Arguments.item(0);
var fileItem;
var error;
var result;

try {
	fileItem = activeXFs.GetFile(wsFileName);
} catch (e) {
	if (e.message.indexOf('File not found') === 0) {
		try {
			fileItem = activeXFs.GetFolder(wsFileName);
		} catch (e) {
			error = e.message;
		}
	} else {
		error = e.message;
	}
}

if (error) {
	result = '{"err":"' + error + '"}';
} else {
	result = '{"hidden":' + !!(fileItem.attributes & 2) + '}';
}

WScript.echo(result);
