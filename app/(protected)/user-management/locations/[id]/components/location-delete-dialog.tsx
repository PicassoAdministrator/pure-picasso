'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RiCheckboxCircleFill, RiErrorWarningFill } from '@remixicon/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
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
import { LoaderCircleIcon } from 'lucide-react';
import { Location } from '@/app/models/location'; // Make sure this import path is correct

// Validation schema for location name confirmation
const NameConfirmationSchema = (locationName: string) =>
  z.object({
    confirmName: z
      .string()
      .nonempty({ message: 'Location name is required.' })
      .refine((value) => value === locationName, {
        message: 'Location name confirmation does not match.',
      }),
  });

type NameConfirmationSchemaType = z.infer<ReturnType<typeof NameConfirmationSchema>>;

interface LocationDeleteDialogProps {
  open: boolean;
  closeDialog: () => void;
  location: Location;
}

const LocationDeleteDialog = ({
  open,
  closeDialog,
  location,
}: LocationDeleteDialogProps) => {
  const queryClient = useQueryClient();

  // Set up the form using react-hook-form and zod validation
  const form = useForm<NameConfirmationSchemaType>({
    resolver: zodResolver(NameConfirmationSchema(location.name)),
    defaultValues: {
      confirmName: '',
    },
    mode: 'onChange',
  });

  // Define the mutation for deleting the location
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`/api/user-management/locations/${location.id}`, {
        method: 'DELETE',
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
            <AlertTitle>Location deleted successfully.</AlertTitle>
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
          <Alert variant="mono" icon="destructive">
            <AlertIcon>
              <RiErrorWarningFill />
            </AlertIcon>
            <AlertTitle>{error.message}</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' }
      );
    },
  });

  const handleSubmit = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent close={false}>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm text-accent-foreground mb-2.5">
            Deleting location{' '}
            <strong className="text-foreground">{location.name}</strong> will
            permanently remove the location and all related data. This action
            cannot be undone.
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-2.5 pt-2.5"
            >
              <FormField
                control={form.control}
                name="confirmName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">
                      Type <b>{location.name}</b> to confirm
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={
                    !form.formState.isDirty ||
                    !form.formState.isValid ||
                    mutation.status === 'pending'
                  }
                >
                  {mutation.status === 'pending' && (
                    <LoaderCircleIcon className="animate-spin" />
                  )}
                  Delete location
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDeleteDialog;
