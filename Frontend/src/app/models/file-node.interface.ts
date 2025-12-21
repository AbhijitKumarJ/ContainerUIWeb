export interface FileNode {
    name: string;
    type: 'file' | 'folder';
    size?: string;
    modified?: Date;
    children?: FileNode[];
}
