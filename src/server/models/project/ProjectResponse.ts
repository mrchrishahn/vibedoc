export interface ProjectDocumentDto {
    id: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    cloudName: string;
    createdAt: Date;
}

export interface ProjectDto {
    id: number;
    name: string;
    systemPrompt: string;
    createdAt: Date;
    updatedAt: Date;
    additionalDocuments: ProjectDocumentDto[];
}

export interface ProjectListItemDto {
    id: number;
    name: string;
    systemPrompt: string;
    documentCount: number;
    createdAt: Date;
} 