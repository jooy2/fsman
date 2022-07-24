declare module 'winattr';
declare module 'fs';

interface Attributes {
    archive: boolean
    hidden: boolean
    readonly: boolean
    system: boolean
}

interface FileStat {
    success: boolean
    isDirectory: boolean
    size: number
    sizeHumanized: string
    name: string
    dirname: string
    path: string
    ext: string
    created: number
    modified: number
}
