
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  CalendarIcon,
  PlusCircle,
  Trash2,
  DollarSign,
  Hash,
  FileText,
  User,
  Phone,
  MapPin,
  Warehouse,
  Boxes,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  REGIONAL_OFFICES,
  REGIONAL_OFFICES_DATA,
  SERVICE_TYPES,
  PURPOSE_TYPES,
  QUANTITY_UNITS,
  CURRENCIES,
  MOVEMENT_LABELS,
} from '@/lib/constants';
import { submitReport } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';

const commoditySchema = z.object({
  name: z.string().min(1, 'Commodity name is required.'),
  quantity: z.coerce.number({invalid_type_error: "Must be a number"}).positive('Must be a positive number.'),
  quantityUnit: z.string(),
  value: z.coerce.number({invalid_type_error: "Must be a number"}).nonnegative('Must be a non-negative number.').optional(),
  valueCurrency: z.string().optional(),
  rejectedQuantity: z.coerce.number({invalid_type_error: "Must be a number"}).nonnegative('Must be a non-negative number.').optional(),
  rejectedQuantityUnit: z.string().optional(),
});

const formSchema = z.object({
  regionalOffice: z.string({ required_error: 'Regional office is required.' }),
  otherOffice: z.string({ required_error: 'This office is required.' }),
  applicationDate: z.date(),
  inspectionDate: z.date(),
  serviceType: z.string({ required_error: 'Service type is required.' }),
  commodities: z.array(commoditySchema).min(1, "Please add at least one commodity."),
  purpose: z.string().optional(),
  clientName: z.string().min(1, 'Client name is required.'),
  documentNumber: z.string().optional(),
  tradeCidNumber: z.string().min(1, 'Trade License/CID number is required.'),
  contactNumber: z.string().min(1, 'Contact number is required.'),
  movementFrom: z.string().min(1, 'This field is required.'),
  movementTo: z.string().min(1, 'This field is required.'),
  serviceProvider: z.string().min(1, 'Service provider name is required.'),
  fines: z.coerce.number({invalid_type_error: "Must be a number"}).nonnegative('Must be a non-negative number.').optional(),
  receiptNumber: z.string().optional(),
  remarks: z.string().optional(),
}).superRefine((data, ctx) => {
    const isInspectionOrIllegal = ['Import Inspection', 'Regulatory Inspection/Illegal'].includes(data.serviceType);
    if (!isInspectionOrIllegal && !data.purpose) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Purpose is required for this service type.',
        path: ['purpose'],
      });
    }
     if (!isInspectionOrIllegal && (!data.documentNumber || data.documentNumber.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Document number is required.',
        path: ['documentNumber'],
      });
    }

    const isPhytoCommercial = data.serviceType === 'Phytosanitary Certificate' && data.purpose === 'Commercial';

    if (isPhytoCommercial) {
        if (!data.clientName || data.clientName.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Name of Client is required.',
                path: ['clientName'],
            });
        }
        if (!data.contactNumber || data.contactNumber.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Contact number is required.',
                path: ['contactNumber'],
            });
        }
        if (!data.tradeCidNumber || data.tradeCidNumber.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Trade License No. is required.',
                path: ['tradeCidNumber'],
            });
        }
        if (!data.documentNumber || data.documentNumber.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'PSC No. is required.',
                path: ['documentNumber'],
            });
        }
    }

  });


export function ReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicationDate: new Date(),
      inspectionDate: new Date(),
      commodities: [{ 
        name: '',
        quantity: 0,
        quantityUnit: 'Kgs',
        value: 0,
        valueCurrency: 'Nu.',
        rejectedQuantity: 0,
        rejectedQuantityUnit: 'Kgs',
      }],
      regionalOffice: '',
      otherOffice: '',
      serviceProvider: 'System User', // Default user
      fines: '' as any,
      receiptNumber: '',
      serviceType: '',
      purpose: '',
      clientName: '',
      documentNumber: '',
      tradeCidNumber: '',
      contactNumber: '',
      movementFrom: '',
      movementTo: '',
      remarks: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'commodities',
  });
  
  const watchedRegionalOffice = form.watch('regionalOffice');
  const watchedServiceType = form.watch('serviceType');
  const watchedPurpose = form.watch('purpose');
  
  const isPurposeDisabled = ['Import Inspection', 'Regulatory Inspection/Illegal'].includes(watchedServiceType);
  const isDocumentNumberDisabled = isPurposeDisabled;
  const isValueDisabled = watchedServiceType === 'Import Inspection';
  const isMovementDisabled = watchedServiceType === 'Import Inspection';
  
  const isPhytoCommercial = watchedServiceType === 'Phytosanitary Certificate' && watchedPurpose === 'Commercial';
  
  const tradeCidLabel = isPhytoCommercial ? 'Trade License No.' : 'CID No.';
  const documentLabel = isPhytoCommercial ? 'PSC No.' : 'Document Number';

  useEffect(() => {
    form.resetField('otherOffice', { defaultValue: '' });
  }, [watchedRegionalOffice, form]);

  useEffect(() => {
    if (isPurposeDisabled) {
      form.resetField('purpose');
    }
    if (isDocumentNumberDisabled) {
        form.resetField('documentNumber');
    }
    if (isValueDisabled) {
      form.getValues('commodities').forEach((_, index) => {
        form.resetField(`commodities.${index}.value`);
        form.resetField(`commodities.${index}.valueCurrency`);
      });
    }
    if (isMovementDisabled) {
        form.resetField('movementFrom');
        form.resetField('movementTo');
    }
  }, [watchedServiceType, isPurposeDisabled, isDocumentNumberDisabled, isValueDisabled, isMovementDisabled, form]);
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await submitReport(values);
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        
        form.reset({
             applicationDate: new Date(),
             inspectionDate: new Date(),
             commodities: [{ 
                name: '',
                quantity: 0,
                quantityUnit: 'Kgs',
                value: 0,
                valueCurrency: 'Nu.',
                rejectedQuantity: 0,
                rejectedQuantityUnit: 'Kgs',
              }],
             regionalOffice: '',
             otherOffice: '',
             serviceProvider: 'System User',
             serviceType: '',
             purpose: '',
             clientName: '',
             documentNumber: '',
             tradeCidNumber: '',
             contactNumber: '',
             movementFrom: '',
             movementTo: '',
             fines: '' as any,
             receiptNumber: '',
             remarks: '',
        });
        
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while submitting the report.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Location & Date</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="regionalOffice" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Regional Office</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a regional office" /></SelectTrigger></FormControl>
                            <SelectContent>{REGIONAL_OFFICES.map(office => <SelectItem key={office} value={office}>{office}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="otherOffice" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Field Office</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchedRegionalOffice}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a field office" /></SelectTrigger></FormControl>
                            <SelectContent>{(watchedRegionalOffice ? REGIONAL_OFFICES_DATA[watchedRegionalOffice] : []).map(office => <SelectItem key={office} value={office}>{office}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="applicationDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date of Application</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent></Popover>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="inspectionDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date of Inspection</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent></Popover>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
        </div>

        <Separator />
        
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Service & Client Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="serviceType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a service type" /></SelectTrigger></FormControl>
                            <SelectContent>{SERVICE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="purpose" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Type / Purpose</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isPurposeDisabled}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a purpose" /></SelectTrigger></FormControl>
                            <SelectContent>{PURPOSE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                        </Select>
                         {isPurposeDisabled && <FormDescription>This field is not applicable for the selected service type.</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="clientName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name of Client</FormLabel>
                        <FormControl><Input placeholder="e.g. John Doe" {...field} icon={User} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="contactNumber" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl><Input placeholder="e.g. 17123456" {...field} icon={Phone} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="tradeCidNumber" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{tradeCidLabel}</FormLabel>
                        <FormControl><Input placeholder={`Enter ${tradeCidLabel}`} {...field} icon={Hash} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="documentNumber" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{documentLabel}</FormLabel>
                        <FormControl><Input placeholder={`Enter ${documentLabel}`} {...field} icon={FileText} disabled={isDocumentNumberDisabled} /></FormControl>
                        {isDocumentNumberDisabled && <FormDescription>This field is not applicable.</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
        </div>

        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Commodity Details</h3>
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                   <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium text-foreground">Commodity #{index + 1}</h4>
                    {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                  <FormField control={form.control} name={`commodities.${index}.name`} render={({ field }) => (
                    <FormItem>
                       <FormLabel>Commodity Inspected or Certified</FormLabel>
                       <FormControl><Input placeholder="e.g. Apples" {...field} icon={Boxes} /></FormControl>
                       <FormMessage />
                    </FormItem>
                  )}/>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField control={form.control} name={`commodities.${index}.quantity`} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantity Certified/Inspected</FormLabel>
                            <div className="flex gap-2"><FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                            <FormField control={form.control} name={`commodities.${index}.quantityUnit`} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{QUANTITY_UNITS.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent></Select>
                            )}/></div><FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name={`commodities.${index}.value`} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Value</FormLabel>
                            <div className="flex gap-2">
                            <FormField control={form.control} name={`commodities.${index}.valueCurrency`} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isValueDisabled}><FormControl><SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                            )}/>
                            <FormControl><Input type="number" placeholder="5000" {...field} disabled={isValueDisabled} /></FormControl>
                            </div>
                            {isValueDisabled && <FormDescription>Not applicable for Import Inspection.</FormDescription>}
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name={`commodities.${index}.rejectedQuantity`} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rejected Quantity</FormLabel>
                            <div className="flex gap-2"><FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                            <FormField control={form.control} name={`commodities.${index}.rejectedQuantityUnit`} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{QUANTITY_UNITS.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent></Select>
                            )}/></div><FormMessage />
                        </FormItem>
                    )}/>
                  </div>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => append({ name: '', quantity: 0, quantityUnit: 'Kgs', value: 0, valueCurrency: 'Nu.', rejectedQuantity: 0, rejectedQuantityUnit: 'Kgs' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Commodity
              </Button>
            </div>
        </div>

        <Separator />

         <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Movement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="movementFrom" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Movement from</FormLabel>
                        <FormControl><Input placeholder="e.g. Thimphu" {...field} icon={MapPin} disabled={isMovementDisabled} /></FormControl>
                        {isMovementDisabled && <FormDescription>Not applicable for Import Inspection.</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="movementTo" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Movement to</FormLabel>
                        <FormControl><Input placeholder="e.g. Paro" {...field} icon={Warehouse} disabled={isMovementDisabled} /></FormControl>
                        {isMovementDisabled && <FormDescription>Not applicable for Import Inspection.</FormDescription>}
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
        </div>

        <Separator />

        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Administrative Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <FormField control={form.control} name="serviceProvider" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Service Provider Name</FormLabel>
                        <FormControl><Input placeholder="e.g. Jane Smith" {...field} icon={User} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="fines" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fees / Fines & Penalties</FormLabel>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Nu.</span>
                            <FormControl><Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} className="pl-10" /></FormControl>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="receiptNumber" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Receipt Number</FormLabel>
                        <FormControl><Input placeholder="Enter receipt number" {...field} icon={Hash} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
        </div>
        
        <Separator />

        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Remarks</h3>
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base sr-only">
                    Remarks/Action taken/Pest & disease observed/NC
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any observations, actions taken, or non-compliances..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information for record-keeping.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Report
        </Button>
      </form>
    </Form>
  );
}
