import React, { forwardRef } from 'react';
import { RFP, SupplierResponse } from '@/apis/types';

interface PrintViewProps {
  type: 'rfp' | 'rfp-list' | 'responses';
  data: RFP | RFP[] | SupplierResponse[];
  rfpTitle?: string;
}

export const PrintView = forwardRef<HTMLDivElement, PrintViewProps>(
  ({ type, data, rfpTitle }, ref) => {

    const renderRfpDetails = (rfp: RFP) => (
      <div className="space-y-6">
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold">RFP Details</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-700">Title</h3>
            <p>{rfp.title}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Status</h3>
            <p>{rfp.status.label}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Created Date</h3>
            <p>{new Date(rfp.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Deadline</h3>
            <p>{new Date(rfp.current_version.deadline).toLocaleDateString()}</p>
          </div>
          {rfp.current_version.budget_min && rfp.current_version.budget_max && (
            <div className="col-span-2">
              <h3 className="font-semibold text-gray-700">Budget Range</h3>
              <p>${rfp.current_version.budget_min.toLocaleString()} - ${rfp.current_version .budget_max.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
          <p className="whitespace-pre-wrap">{rfp.current_version.description}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Requirements</h3>
          <p className="whitespace-pre-wrap">{rfp.current_version.requirements}</p>
        </div>

        {rfp.current_version.notes && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
            <p className="whitespace-pre-wrap">{rfp.current_version.notes}</p>
          </div>
        )}
      </div>
    );

    const renderRfpList = (rfps: RFP[]) => (
      <div className="space-y-6">
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold">RFP List</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          <p className="text-gray-600">Total RFPs: {rfps.length}</p>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Created</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Deadline</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Budget</th>
            </tr>
          </thead>
          <tbody>
            {rfps.map((rfp) => (
              <tr key={rfp.id}>
                <td className="border border-gray-300 px-4 py-2">{rfp.title}</td>
                <td className="border border-gray-300 px-4 py-2">{rfp.status.label}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(rfp.created_at).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(rfp.current_version.deadline).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {rfp.current_version.budget_min && rfp.current_version.budget_max
                    ? `$${rfp.current_version.budget_min.toLocaleString()} - $${rfp.current_version.budget_max.toLocaleString()}`
                    : 'Not specified'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    const renderResponseList = (responses: SupplierResponse[]) => (
      <div className="space-y-6">
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold">
            {rfpTitle ? `Responses for: ${rfpTitle}` : 'Response List'}
          </h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          <p className="text-gray-600">Total Responses: {responses.length}</p>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Supplier</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Budget</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Timeline</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response) => (
              <tr key={response.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {response.supplier?.email || 'N/A'}
                </td>
                <td className="border border-gray-300 px-4 py-2">{response.status.label}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {response.proposed_budget 
                    ? `$${response.proposed_budget.toLocaleString()}`
                    : 'N/A'
                  }
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {response.timeline || 'N/A'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(response.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    return (
      <div ref={ref} className="print:block hidden bg-white p-8 text-black">
        <style>
          {`
            @media print {
              body { margin: 0; }
              .print\\:block { display: block !important; }
              .hidden { display: none !important; }
            }
          `}
        </style>
        
        {type === 'rfp' && !Array.isArray(data) && renderRfpDetails(data as RFP)}
        {type === 'rfp-list' && Array.isArray(data) && renderRfpList(data as RFP[])}
        {type === 'responses' && Array.isArray(data) && renderResponseList(data as SupplierResponse[])}
      </div>
    );
  }
);

PrintView.displayName = 'PrintView';
