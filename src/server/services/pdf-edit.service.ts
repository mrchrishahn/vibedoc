import { env } from "~/env";

interface PdfEditAddRequest {
    url: string;
    annotations?: Array<{
        text?: string;
        type?: 'text' | 'textField' | 'TextFieldMultiline' | 'checkbox';
        id?: string;
        x: number;
        y: number;
        width?: number;
        height?: number;
        alignment?: 'left' | 'center' | 'right';
        pages?: string;
        color?: string;
        link?: string;
        size?: number;
        transparent?: boolean;
        fontName?: string;
        fontBold?: boolean;
        fontStrikeout?: boolean;
        fontUnderline?: boolean;
        RotationAngle?: number;
    }>;
    images?: Array<{
        url: string;
        x: number;
        y: number;
        width?: number;
        height?: number;
        pages?: string;
        link?: string;
        keepAspectRatio?: boolean;
    }>;
    fields?: Array<{
        fieldName: string;
        text: string;
        pages?: string;
        size?: number;
        fontName?: string;
        fontBold?: boolean;
        fontItalic?: boolean;
        fontStrikeout?: boolean;
        fontUnderline?: boolean;
    }>;
    httpusername?: string;
    httppassword?: string;
    password?: string;
    name?: string;
    expiration?: number;
    inline?: boolean;
    async?: boolean;
    profiles?: Record<string, unknown>;
}

interface PdfEditAddResponse {
    url: string;
    status: string;
    error: boolean;
    message: string;
}

export class PdfEditService {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.pdf.co/v1';

    constructor() {
        if (!env.PDF_CO_TOKEN) {
            throw new Error('PDF.co API token is not configured');
        }
        this.apiKey = env.PDF_CO_TOKEN;
    }

    /**
     * Edit a PDF file by adding text annotations, images, or modifying form fields
     * @param request The edit request parameters
     * @returns A promise that resolves to the edited PDF file URL
     */
    async editPdf(request: PdfEditAddRequest): Promise<PdfEditAddResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/pdf/edit/add`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error(`PDF.co API error: ${response.statusText}`);
            }

            const result = await response.json() as PdfEditAddResponse;
            return result;
        } catch (error) {
            console.error('Error editing PDF:', error);
            throw error;
        }
    }
} 