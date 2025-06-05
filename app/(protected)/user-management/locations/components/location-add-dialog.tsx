'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircleIcon } from 'lucide-react';

// Add parentId to schema
const LocationAddSchema = z.object({
  name: z.string().min(2, 'Location name is required'),
  parentId: z.string().nullable().optional(),
});
type LocationAddSchemaType = z.infer<typeof LocationAddSchema>;

const LocationAddDialog = ({
  open,
  closeDialog,
}: {
  open: boolean;
  closeDialog: () => void;
}) => {
  const queryClient = useQueryClient();

  // Fetch locations for parent dropdown
  const { data: parentOptions = [] } = useQuery({
    queryKey: ['locations', 'all'],
    queryFn: async () => {
      const res = await apiFetch('/api/user-management/locations?limit=1000');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data;
    },
    enabled: open,
  });

  const form = useForm<LocationAddSchemaType>({
    resolver: zodResolver(LocationAddSchema),
    defaultValues: { name: '', parentId: 'none' },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: async (values: LocationAddSchemaType) => {
      const response = await apiFetch('/api/user-management/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      return response.json();
    },
    onSuccess: () => {
      toast.custom(
        () => (
          <Alert variant="mono" icon="success" close={false}>
            <AlertIcon />
            <AlertTitle>Location added successfully</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' }
      );
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      closeDialog();
    },
    onError: (error: Error) => {
      toast.custom(
        () => (
          <Alert variant="mono" icon="destructive" close={false}>
            <AlertIcon />
            <AlertTitle>{error.message}</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' }
      );
    },
  });

  const isProcessing = mutation.status === 'pending';

  const handleSubmit = (values: LocationAddSchemaType) => {
  mutation.mutate({
    ...values,
    parentId: values.parentId === 'none' ? null : values.parentId,
  });
};

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Location</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogBody className="pt-2.5 space-y-6">
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
                    <FormLabel>Parent Location (optional)</FormLabel>
                    <FormControl>
                        <Select
                        onValueChange={field.onChange}
                        value={field.value || 'none'}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="No parent (top-level location)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No parent (top-level)</SelectItem>
                            {parentOptions
                            .filter((loc: any) => !loc.parent)
                            .map((loc: any) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                {loc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isDirty || isProcessing}
              >
                {isProcessing && <LoaderCircleIcon className="animate-spin" />}
                Add location
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationAddDialog;
