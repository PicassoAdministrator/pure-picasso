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
import { User, UserRole } from '@/app/models/user';
import { useRoleSelectQuery } from '../../../roles/hooks/use-role-select-query';
import { UserStatusProps } from '../../constants/status';
import {
  UserProfileSchema,
  UserProfileSchemaType,
} from '../forms/user-profile-schema';

// --- Types ---
type LocationSelectOption = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  closeDialog: () => void;
  user?: User;
};

const UserProfileEditDialog = ({ open, closeDialog, user }: Props) => {
  // Blank return BEFORE hooks for compliance
  if (!user) return null;

  const queryClient = useQueryClient();
  const { data: roleList = [] } = useRoleSelectQuery();

  // Defensive: Only try to access UserLocation if user is defined
  const userPrimaryLocationId =
    user.UserLocation?.find((ul) => ul.isPrimary)?.location?.id || '';

  const form = useForm<UserProfileSchemaType>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      name: user.name || '',
      roleId: user.roleId || '',
      status: user.status || '',
      primaryLocationId: userPrimaryLocationId,
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (open && user) {
      form.reset({
        name: user.name || '',
        roleId: user.roleId || '',
        status: user.status || '',
        primaryLocationId:
          user.UserLocation?.find((ul) => ul.isPrimary)?.location?.id || '',
      });
    }
  }, [open, user, form]);

  const mutation = useMutation({
    mutationFn: async (values: UserProfileSchemaType) => {
      const response = await apiFetch(`/api/user-management/users/${user.id}`, {
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
            <AlertTitle>User updated successfully</AlertTitle>
          </Alert>
        ),
        { position: 'top-center' },
      );
      queryClient.invalidateQueries({ queryKey: ['user-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-user'] });
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

  const handleSubmit = (values: UserProfileSchemaType) => {
    const payload = {
      ...values,
      primaryLocationId: values.primaryLocationId === 'none' ? null : values.primaryLocationId,
    };
    mutation.mutate(payload);
  };

  // --- Fetch all locations for select dropdown, always call at top level
  const { data: locations = [] } = useQuery<LocationSelectOption[]>({
    queryKey: ['locations', 'all'],
    queryFn: async () => {
      const res = await apiFetch('/api/user-management/locations?limit=1000');
      if (!res.ok) return [];
      const json = await res.json();
      // Only need id and name for select
      return (json.data || []).map((loc: any) => ({
        id: loc.id,
        name: loc.name,
      }));
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent close={false}>
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter user name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roleList?.map((role: UserRole) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
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
            <FormField
              control={form.control}
              name="primaryLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Location</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={val => field.onChange(val === 'none' ? '' : val)}
                      value={field.value || 'none'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a primary location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None assigned</SelectItem>
                        {locations.map((loc) => (
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
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(UserStatusProps).map(
                            ([status, { label }]) => (
                              <SelectItem key={status} value={status}>
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
              <Button
                type="submit"
                disabled={!form.formState.isDirty || isProcessing}
              >
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

export default UserProfileEditDialog;
