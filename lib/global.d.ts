declare module 'winattr';
declare module 'fs';

interface FileStat {
	success: boolean;
	isDirectory: boolean;
	size: number;
	sizeHumanized: string;
	name: string;
	dirname: string;
	path: string;
	ext: string;
	created: number;
	modified: number;
}
