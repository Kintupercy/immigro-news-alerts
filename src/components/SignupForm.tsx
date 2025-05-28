
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  categories: z.array(z.string()).min(1, 'Please select at least one category'),
});

const immigrationCategories = [
  { id: 'international-students', label: 'International students (F-1, J-1, M-1)' },
  { id: 'employment-based', label: 'Employment-based immigrants (H-1B, L-1, TN, etc.)' },
  { id: 'family-based', label: 'Family-based immigrants' },
  { id: 'green-card', label: 'Green card applicants/holders' },
  { id: 'citizenship', label: 'Citizenship applicants' },
  { id: 'refugees-asylees', label: 'Refugees/asylees/DACA/TPS holders' },
  { id: 'investors', label: 'Investors/entrepreneurs' },
  { id: 'religious-workers', label: 'Religious workers' },
  { id: 'undocumented', label: 'Undocumented & mixed-status families' },
  { id: 'temporary-visitors', label: 'Temporary visitors' },
];

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      categories: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Insert email subscription with preferences
      const { error } = await supabase
        .from('email_subscriptions')
        .insert({
          email: values.email,
          preferences: {
            firstName: values.firstName,
            lastName: values.lastName,
            categories: values.categories,
          },
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've been subscribed to receive curated immigration news.",
      });

      form.reset();
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Get Curated Immigration News
        </h2>
        <p className="text-lg text-gray-600">
          Select your relevant categories to receive personalized immigration updates
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categories"
            render={() => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">
                  Select Your Immigration Categories
                </FormLabel>
                <div className="grid grid-cols-1 gap-3 mt-4">
                  {immigrationCategories.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categories"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={category.id}
                            className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, category.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== category.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {category.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Subscribing...' : 'Subscribe to Curated News'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;
