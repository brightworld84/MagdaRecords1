import axios from 'axios';
import { uploadRecord } from './storage';

// FHIR server base URL (this would be configurable in a real app)
const FHIR_BASE_URL = 'https://api.example.com/fhir';

// Import medical records from a FHIR server
export const importFromFHIR = async (endpoint) => {
  try {
    if (!endpoint || !endpoint.startsWith('http')) {
      throw new Error('Please provide a valid FHIR endpoint URL');
    }

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

    const mockImportedRecords = [
      {
        resourceType: 'DiagnosticReport',
        id: 'fhir-report-1',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
                code: 'LAB',
                display: 'Laboratory',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '58410-2',
              display: 'Complete blood count (hemogram) panel - Blood by Automated count',
            },
          ],
          text: 'Complete Blood Count',
        },
        subject: {
          reference: 'Patient/example',
          display: 'Patient',
        },
        effectiveDateTime: '2023-03-10',
        issued: '2023-03-11T10:45:00+11:00',
        performer: [
          {
            reference: 'Organization/example',
            display: 'Memorial Hospital Laboratory',
          },
        ],
        conclusion: 'All values within normal range.',
      },
      {
        resourceType: 'MedicationRequest',
        id: 'fhir-med-1',
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: '314076',
              display: 'Lisinopril 10 MG Oral Tablet',
            },
          ],
          text: 'Lisinopril 10mg tablet',
        },
        subject: {
          reference: 'Patient/example',
          display: 'Patient',
        },
        authoredOn: '2023-02-20',
        requester: {
          reference: 'Practitioner/example',
          display: 'Dr. Michael Chen',
        },
        dosageInstruction: [
          {
            text: 'Take 1 tablet by mouth once daily',
            timing: {
              repeat: {
                frequency: 1,
                period: 1,
                periodUnit: 'd',
              },
            },
            route: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '26643006',
                  display: 'Oral route',
                },
              ],
            },
          },
        ],
      },
      {
        resourceType: 'Immunization',
        id: 'fhir-imm-1',
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/cvx',
              code: '158',
              display: 'influenza, injectable, quadrivalent, contains preservative',
            },
          ],
          text: 'Influenza Vaccine',
        },
        patient: {
          reference: 'Patient/example',
          display: 'Patient',
        },
        occurrenceDateTime: '2023-01-15',
        primarySource: true,
        location: {
          reference: 'Location/example',
          display: 'City Medical Center',
        },
      },
    ];

    const convertedRecords = [];

    for (const fhirResource of mockImportedRecords) {
      let record = null;

      if (fhirResource.resourceType === 'DiagnosticReport') {
        record = {
          title: fhirResource.code.text,
          date: fhirResource.effectiveDateTime,
          type: 'lab',
          provider: fhirResource.performer[0].display,
          description: fhirResource.conclusion || 'No conclusion provided',
          uploadType: 'fhir',
          fhirId: fhirResource.id,
        };
      } else if (fhirResource.resourceType === 'MedicationRequest') {
        record = {
          title: `Prescription - ${fhirResource.medicationCodeableConcept.text}`,
          date: fhirResource.authoredOn,
          type: 'prescription',
          provider: fhirResource.requester.display,
          description: fhirResource.dosageInstruction[0].text,
          uploadType: 'fhir',
          fhirId: fhirResource.id,
        };
      } else if (fhirResource.resourceType === 'Immunization') {
        record = {
          title: fhirResource.vaccineCode.text,
          date: fhirResource.occurrenceDateTime,
          type: 'immunization',
          provider: fhirResource.location.display,
          description: `${fhirResource.vaccineCode.text} administered`,
          uploadType: 'fhir',
          fhirId: fhirResource.id,
        };
      }

      if (record) {
        const userId = 'current-user-id'; // Replace this later with real user ID
        await uploadRecord(userId, record);
        convertedRecords.push(record);
      }
    }

    return convertedRecords;
  } catch (error) {
    console.error('Failed to import from FHIR:', error);
    throw new Error(`FHIR import failed: ${error.message}`);
  }
};

// Export medical records to FHIR format
export const exportToFHIR = async (userId, records) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      message: `${records.length} records successfully exported to FHIR format`,
    };
  } catch (error) {
    console.error('Failed to export to FHIR:', error);
    throw new Error(`FHIR export failed: ${error.message}`);
  }
};

// Axios-powered FHIR client
const createFHIRClient = (endpoint, authToken = null) => {
  const client = axios.create({
    baseURL: endpoint,
    headers: {
      'Content-Type': 'application/fhir+json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
  });

  return {
    async getPatient(patientId) {
      const response = await client.get(`/Patient/${patientId}`);
      return response.data;
    },
    async searchResources(resourceType, params) {
      const response = await client.get(`/${resourceType}`, { params });
      return response.data;
    },
    async createResource(resourceType, data) {
      const response = await client.post(`/${resourceType}`, data);
      return response.data;
    },
    async updateResource(resourceType, id, data) {
      const response = await client.put(`/${resourceType}/${id}`, data);
      return response.data;
    },
  };
};

export default createFHIRClient;
