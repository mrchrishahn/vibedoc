import { PDFDocument } from 'pdf-lib';
import type { InputDto } from '~/server/models/form/FormDTO';

function getStringValue(val: unknown): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    return '';
}

export async function generateFilledPDF(pdfUrl: string, inputs: InputDto[]): Promise<Uint8Array> {
    // Fetch the PDF
    const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: true
    });

    // Get the form from the PDF
    const form = pdfDoc.getForm();

    const allFields = form.getFields();
    console.log(allFields);

    // const firstFIeld = allFields[0]

    // if (firstFIeld) {
    //     const qualifiedName = firstFIeld.acroField.getFullyQualifiedName()
    //     console.log(qualifiedName);

    //     if (qualifiedName) {
    //         const textField = form.getTextField(qualifiedName)
    //         console.log(textField);
    //         console.log(`Setting text to "test"`)
    //         textField.setText("test")
    //     }
    // }

    // const otherId = `topmostSubform[0].Page1[0].f1_02[0]`

    // const otherField = form.getTextField(otherId)
    // console.log(`Here is another field:`)
    // console.log(otherField);

    // if (otherField) {
    //     otherField.setText("test")
    // }

    // Fill in each field
    for (const input of inputs) {
        try {
            const field = form.getField(input.pdfElementId);

            if (!field) {
                console.warn(`Field ${input.pdfElementId} not found in PDF`);
                continue;
            }

            switch (input.type) {
                case 'CHECKBOX':
                    const checkbox = form.getCheckBox(input.pdfElementId);
                    if (input.value === true) {
                        checkbox.check();
                    } else {
                        checkbox.uncheck();
                    }
                    break;

                case 'SELECT':
                case 'INPUT':
                    const textField = form.getTextField(input.pdfElementId);
                    textField.setText(getStringValue(input.value));
                    break;
            }
        } catch (error) {
            console.warn(`Error filling field ${input.pdfElementId}:`, error);
        }
    }

    // Flatten the form (optional - makes it non-editable)
    form.flatten();

    // Save the PDF
    return await pdfDoc.save();
} 