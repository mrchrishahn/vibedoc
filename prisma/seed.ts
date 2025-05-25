import { PrismaClient, InputType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Clean up existing data
    await prisma.project.deleteMany();

    // Create sample projects
    const medicalProject = await prisma.project.create({
        data: {
            name: 'Medical Forms Assistant',
            systemPrompt: `You are an AI assistant specialized in helping medical professionals fill out forms accurately and efficiently. 
Your main responsibilities are:
1. Understanding medical terminology and context
2. Ensuring all required fields are filled correctly
3. Maintaining patient confidentiality
4. Providing helpful suggestions based on medical best practices
Please assist in completing these medical forms while adhering to all relevant healthcare regulations and standards.`,
            forms: {
                create: [
                    {
                        name: 'Patient Intake Form',
                        cloudName: 'sample-patient-intake',
                        fileName: 'patient_intake.pdf',
                        fileType: 'application/pdf',
                        fileSize: 150000,
                        inputs: {
                            create: [
                                {
                                    name: 'Patient Name',
                                    description: 'Full legal name of the patient',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "patient_name"
                                },
                                {
                                    name: 'Date of Birth',
                                    description: 'Patient date of birth (MM/DD/YYYY)',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "date_of_birth"
                                },
                                {
                                    name: 'Has Allergies',
                                    description: 'Does the patient have any known allergies?',
                                    type: InputType.CHECKBOX,
                                    value: false,
                                    pdfElementId: "has_allergies"
                                },
                                {
                                    name: 'Insurance Type',
                                    description: 'Type of insurance coverage',
                                    type: InputType.SELECT,
                                    value: "",
                                    pdfElementId: "insurance_type"
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    const legalProject = await prisma.project.create({
        data: {
            name: 'Legal Documents Assistant',
            systemPrompt: `You are an AI assistant specialized in helping legal professionals complete documentation accurately and efficiently.
Your main responsibilities are:
1. Understanding legal terminology and context
2. Ensuring all required fields are properly completed
3. Maintaining client confidentiality
4. Providing relevant legal context and suggestions
Please assist in completing these legal documents while adhering to all relevant legal standards and requirements.`,
            forms: {
                create: [
                    {
                        name: 'Client Engagement Agreement',
                        cloudName: 'sample-engagement-agreement',
                        fileName: 'engagement_agreement.pdf',
                        fileType: 'application/pdf',
                        fileSize: 200000,
                        inputs: {
                            create: [
                                {
                                    name: 'Client Name',
                                    description: 'Full legal name of the client',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "client_name"
                                },
                                {
                                    name: 'Representation Type',
                                    description: 'Type of legal representation',
                                    type: InputType.SELECT,
                                    value: "",
                                    pdfElementId: "representation_type"
                                },
                                {
                                    name: 'Conflict Check Complete',
                                    description: 'Has a conflict check been completed?',
                                    type: InputType.CHECKBOX,
                                    value: false,
                                    pdfElementId: "conflict_check"
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    // Create a form that matches the sample PDF
    const sampleProject = await prisma.project.create({
        data: {
            name: 'Sample Tax Forms',
            systemPrompt: 'You are an AI assistant specialized in helping with tax form completion.',
            forms: {
                create: [
                    {
                        name: 'Form-to-fill.pdf',
                        cloudName: 'sample-form-to-fill',
                        fileName: 'Form-to-fill.pdf',
                        fileType: 'application/pdf',
                        fileSize: 250000,
                        inputs: {
                            create: [
                                {
                                    name: 'Company Name',
                                    description: 'The name of the company you want to fill this form out for',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "company_name"
                                },
                                {
                                    name: 'Is this an LLC?',
                                    description: 'If this company qualifies as a legal LLC',
                                    type: InputType.CHECKBOX,
                                    value: false,
                                    pdfElementId: "is_llc"
                                },
                                {
                                    name: 'First Name',
                                    description: 'First name of the person',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "first_name"
                                },
                                {
                                    name: 'Last Name',
                                    description: 'Last name of the person',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "last_name"
                                },
                                {
                                    name: 'Social Security Number',
                                    description: 'Social security number',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "ssn"
                                },
                                {
                                    name: 'Filing Status',
                                    description: 'Tax filing status',
                                    type: InputType.SELECT,
                                    value: "",
                                    pdfElementId: "filing_status"
                                },
                                {
                                    name: 'Address',
                                    description: 'Home address',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "address"
                                },
                                {
                                    name: 'City',
                                    description: 'City',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "city"
                                },
                                {
                                    name: 'State',
                                    description: 'State',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "state"
                                },
                                {
                                    name: 'ZIP Code',
                                    description: 'ZIP code',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "zip_code"
                                },
                                {
                                    name: 'Wages',
                                    description: 'Total wages from W-2',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "wages"
                                },
                                {
                                    name: 'Federal Tax Withheld',
                                    description: 'Federal income tax withheld',
                                    type: InputType.INPUT,
                                    value: "",
                                    pdfElementId: "federal_tax_withheld"
                                }
                            ]
                        }
                    }
                ]
            }
        }
    });

    console.log('Database seeded successfully!');
    console.log('Created projects:', {
        medical: medicalProject.id,
        legal: legalProject.id,
        sample: sampleProject.id
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        void prisma.$disconnect();
    });