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
import { Location } from '@/app/models/location'; // update this path if needed

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

interface LocationRestoreDialogProps {
  open: boolean;
  closeDialog: () => void;
  location: Location;
}

const LocationRestoreDialog = ({
  open,
  closeDialog,
  location,
}: LocationRestoreDialogProps) => {
  const queryClient = useQueryClient();

  // Set up the form using react-hook-form and zod validation
  const form = useForm<NameConfirmationSchemaType>({
    resolver: zodResolver(NameConfirmationSchema(location.name)),
    defaultValues: {
      confirmName: '',
    },
    mode: 'onChange',
  });

  // Define the mutation for restoring the location
  const mutation = useMutation({
    mutationFn: async () => {
      // PATCH to restore endpoint; adjust endpoint/method if yours is different
      const response = await apiFetch(
        `/api/user-management/locations/${location.id}/restore`,
        {
          method: 'PATCH',
        },
      );

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
            <AlertTitle>Location restored successfully.</AlertTitle>
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
          <DialogTitle>Confirm Restore</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm text-accent-foreground mb-2.5">
            Restoring location{' '}
            <strong className="text-foreground">{location.name}</strong> will
            reactivate the location and all related data.
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
                  Restore location
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationRestoreDialog;
