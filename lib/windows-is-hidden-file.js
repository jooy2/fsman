// http://stackoverflow.com/questions/13440589/retrieve-file-attributes-from-windows-cmd
var error = '';
var fs = new ActiveXObject('Scripting.FileSystemObject');
var name = WScript.Arguments.item(0);
var file;
var json;

try {
	file = fs.GetFile(name);
} catch (e) {
	if (e.message.indexOf('File not found') === 0) {
		try {
			file = fs.GetFolder(name);
		} catch (e) {
			error = e.message;
		}
	} else {
		error = e.message;
	}
}

if (error === '') {
	json = '{';
	json += '"hidden":' + !!(file.attributes & 2);
	json += '}';
} else {
	json = '{"error":"' + error + '"}';
}

WScript.echo(json);
