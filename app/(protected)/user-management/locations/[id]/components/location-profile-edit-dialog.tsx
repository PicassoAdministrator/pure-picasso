'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoaderCircleIcon } from 'lucide-react';
import { z } from 'zod';

// If your locations have a status, define your status options here:
const LocationStatusProps = {
  active: { label: 'Active' },
  inactive: { label: 'Inactive' },
  archived: { label: 'Archived' },
};

// --------- Schema --------------
const LocationProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  parentId: z.string().nullable().optional(),
  status: z.string().optional(), // remove if you don't use status
});
type LocationProfileSchemaType = z.infer<typeof LocationProfileSchema>;

// --------- Main Component -----------
const LocationProfileEditDialog = ({
  open,
  closeDialog,
  location,
}: {
  open: boolean;
  closeDialog: () => void;
  location?: any; // Replace with your Location type if defined
}) => {
  if (!location) return null;

  const queryClient = useQueryClient();

  // Fetch all locations for parent selection (exclude self)
  const { data: locations = [] } = useQuery({
    queryKey: ['locations', 'all'],
    queryFn: async () => {
      const res = await apiFetch('/api/user-management/locations?limit=1000');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data;
    },
    enabled: open,
  });

  const form = useForm<LocationProfileSchemaType>({
    resolver: zodResolver(LocationProfileSchema),
    defaultValues: {
      name: location?.name || '',
      parentId: location?.parent?.id || '',
      status: location?.status || '', // remove if you don't use status
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (open && location) {
      form.reset({
        name: location.name || '',
        parentId: location.parent?.id || '',
        status: location.status || '',
      });
    }
  }, [open, location, form]);

  const mutation = useMutation({
    mutationFn: async (values: LocationProfileSchemaType) => {
      const response = await apiFetch(`/api/user-management/locations/${location.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.custom(
        () => (
          <Alert variant="mono" icon="success">
            <AlertIcon>
              <RiCheckboxCircleFill />
            </AlertIcon>
            <AlertTitle>Location updated successfully</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' },
      );

      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location', location.id] });
      closeDialog();
    },
    onError: (error: Error) => {
      toast.custom(
        () => (
          <Alert variant="mono" icon="destructive">
            <AlertIcon>
              <RiErrorWarningFill />
            </AlertIcon>
            <AlertTitle>{error.message}</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' },
      );
    },
  });

  const isProcessing = mutation.status === 'pending';

  const handleSubmit = (values: LocationProfileSchemaType) => {
    // Convert '' (none) to null for parentId if needed
    const payload = { ...values, parentId: values.parentId === '' ? null : values.parentId };
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent close={false}>
        <DialogHeader>
          <DialogTitle>Edit Location Details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {mutation.status === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>{mutation.error.message}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Location</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || "none"}
                      onValueChange={val => field.onChange(val === "none" ? null : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="none">None</SelectItem>
                          {locations
                            .filter(
                              (loc: any) =>
                                loc &&
                                typeof loc.id === "string" &&
                                loc.id.length > 0 &&
                                loc.id !== location.id
                            )
                            .map((loc: any) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            {/* If your locations have a status field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ''}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(LocationStatusProps).map(
                            ([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ),
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={!form.formState.isDirty || isProcessing}>
                {isProcessing && <LoaderCircleIcon className="animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationProfileEditDialog;
