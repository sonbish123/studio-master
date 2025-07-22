
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Download, Search } from "lucide-react";
import Link from "next/link";
import { DeleteReportButton } from "./delete-report-button";
import { REGIONAL_OFFICES, SERVICE_TYPES } from '@/lib/constants';
import * as XLSX from 'xlsx';

export function ReportsTable({ reports: initialReports }: { reports: any[] }) {
  const [reports, setReports] = useState(initialReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionalOfficeFilter, setRegionalOfficeFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        report.clientName?.toLowerCase().includes(searchLower) ||
        report.tradeCidNumber?.toLowerCase().includes(searchLower) ||
        report.documentNumber?.toLowerCase().includes(searchLower) ||
        report.remarks?.toLowerCase().includes(searchLower) ||
        report.serviceProvider?.toLowerCase().includes(searchLower) ||
        report.id?.toLowerCase().includes(searchLower);

      const matchesRegionalOffice =
        regionalOfficeFilter === 'all' || report.regionalOffice === regionalOfficeFilter;

      const matchesServiceType =
        serviceTypeFilter === 'all' || report.serviceType === serviceTypeFilter;

      return matchesSearch && matchesRegionalOffice && matchesServiceType;
    });
  }, [reports, searchTerm, regionalOfficeFilter, serviceTypeFilter]);

  const downloadToExcel = () => {
    const flattenedData = filteredReports.flatMap(report => {
      if (report.commodities && report.commodities.length > 0) {
        return report.commodities.map((commodity: any) => ({
          'Regional Office': report.regionalOffice,
          'Field Office': report.otherOffice,
          'Application Date': new Date(report.applicationDate).toLocaleDateString(),
          'Inspection Date': new Date(report.inspectionDate).toLocaleDateString(),
          'Service Type': report.serviceType,
          'Purpose': report.purpose,
          'Client Name': report.clientName,
          'Contact No.': report.contactNumber,
          'CID/Trade License No.': report.tradeCidNumber,
          'Document/PSC No.': report.documentNumber,
          'Commodity': commodity.name,
          'Quantity Inspected/Certified': `${commodity.quantity} ${commodity.quantityUnit}`,
          'Value': commodity.value ? `${commodity.valueCurrency || ''}${commodity.value}` : 'N/A',
          'Rejected Quantity': commodity.rejectedQuantity ? `${commodity.rejectedQuantity} ${commodity.rejectedQuantityUnit}` : 'N/A',
          'Movement From': report.movementFrom,
          'Movement To': report.movementTo,
          'Service Provider': report.serviceProvider,
          'Fees/Fines': report.fines,
          'Receipt No.': report.receiptNumber,
          'Remarks': report.remarks,
        }));
      }
      // Handle reports with no commodities
      return [{
        'Regional Office': report.regionalOffice,
        'Field Office': report.otherOffice,
        'Application Date': new Date(report.applicationDate).toLocaleDateString(),
        'Inspection Date': new Date(report.inspectionDate).toLocaleDateString(),
        'Service Type': report.serviceType,
        'Purpose': report.purpose,
        'Client Name': report.clientName,
        'Contact No.': report.contactNumber,
        'CID/Trade License No.': report.tradeCidNumber,
        'Document/PSC No.': report.documentNumber,
        'Commodity': 'N/A',
        'Quantity Inspected/Certified': 'N/A',
        'Value': 'N/A',
        'Rejected Quantity': 'N/A',
        'Movement From': report.movementFrom,
        'Movement To': report.movementTo,
        'Service Provider': report.serviceProvider,
        'Fees/Fines': report.fines,
        'Receipt No.': report.receiptNumber,
        'Remarks': report.remarks,
      }];
    });

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "reports.xlsx");
  };


  const formatCommodities = (commodities: any[]) => {
    if (!commodities || commodities.length === 0) return 'N/A';
    return (
      <div>
        {commodities.map((c, index) => (
          <div key={index}>{c.name}</div>
        ))}
      </div>
    );
  };

  const formatQuantity = (commodities: any[]) => {
    if (!commodities || commodities.length === 0) return 'N/A';
    return (
      <div>
        {commodities.map((c, index) => (
          <div key={index}>
            {c.quantity} {c.quantityUnit}
          </div>
        ))}
      </div>
    );
  };

  const formatValue = (commodities: any[]) => {
    if (!commodities || commodities.length === 0) return 'N/A';
    return (
      <div>
        {commodities.map((c, index) => (
          <div key={index}>
            {c.value ? `${c.valueCurrency || ''}${c.value}` : 'N/A'}
          </div>
        ))}
      </div>
    );
  };

  const formatRejectedQuantity = (commodities: any[]) => {
    if (!commodities || commodities.length === 0) return 'N/A';
    return (
      <div>
        {commodities.map((c, index) => (
          <div key={index}>
            {(c.rejectedQuantity || c.rejectedQuantity === 0) ? `${c.rejectedQuantity} ${c.rejectedQuantityUnit || ''}`.trim() : 'N/A'}
          </div>
        ))}
      </div>
    );
  };


  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative w-full sm:w-auto sm:flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9"
            />
          </div>
          <div className="flex gap-4">
              <Select value={regionalOfficeFilter} onValueChange={setRegionalOfficeFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by Regional Office" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Regional Offices</SelectItem>
                      {REGIONAL_OFFICES.map(office => (
                          <SelectItem key={office} value={office}>{office}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Service Types</SelectItem>
                      {SERVICE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
          <Button onClick={downloadToExcel} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Download
          </Button>
      </div>
      <div className="w-full overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Regional Office</TableHead>
              <TableHead>Field Office</TableHead>
              <TableHead>Date of Application</TableHead>
              <TableHead>Date of Inspection</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Type / Purpose</TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Contact No.</TableHead>
              <TableHead>CID/Trade License No.</TableHead>
              <TableHead>Document/PSC No.</TableHead>
              <TableHead>Commodities</TableHead>
              <TableHead>Quantity Inspected/Certified</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Rejected Quantity</TableHead>
              <TableHead>Movement From</TableHead>
              <TableHead>Movement To</TableHead>
              <TableHead>Service Provider Name</TableHead>
              <TableHead>Fees/Fines & Penalties</TableHead>
              <TableHead>Receipt No.</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell>{report.regionalOffice}</TableCell>
                  <TableCell>{report.otherOffice}</TableCell>
                  <TableCell>{new Date(report.applicationDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(report.inspectionDate).toLocaleDateString()}</TableCell>
                  <TableCell>{report.serviceType}</TableCell>
                  <TableCell>{report.purpose || 'N/A'}</TableCell>
                  <TableCell>{report.clientName}</TableCell>
                  <TableCell>{report.contactNumber}</TableCell>
                  <TableCell>{report.tradeCidNumber}</TableCell>
                  <TableCell>{report.documentNumber || 'N/A'}</TableCell>
                  <TableCell>{formatCommodities(report.commodities)}</TableCell>
                  <TableCell>{formatQuantity(report.commodities)}</TableCell>
                  <TableCell>{formatValue(report.commodities)}</TableCell>
                  <TableCell>{formatRejectedQuantity(report.commodities)}</TableCell>
                  <TableCell>{report.movementFrom || 'N/A'}</TableCell>
                  <TableCell>{report.movementTo || 'N/A'}</TableCell>
                  <TableCell>{report.serviceProvider}</TableCell>
                  <TableCell>{report.fines || 0}</TableCell>
                  <TableCell>{report.receiptNumber || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">{report.remarks || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon" className="mr-2">
                       <Link href={`/admin/edit/${report.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteReportButton reportId={report.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={21}
                  className="h-24 text-center text-muted-foreground"
                >
                  No reports match your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
