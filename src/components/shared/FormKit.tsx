import { ReactNode } from 'react'
import { useForm, FormProvider, FieldValues, DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'

export interface FormField {
  name: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'switch' | 'checkbox' | 'date'
  label: string
  description?: string
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  required?: boolean
  validation?: z.ZodType<any, any>
}

interface FormKitProps<T extends FieldValues> {
  schema: z.ZodType<T>
  defaultValues?: DefaultValues<T>
  fields: FormField[]
  onSubmit: (data: T) => void | Promise<void>
  submitLabel?: string
  loading?: boolean
  actions?: ReactNode
  testId?: string
}

export function FormKit<T extends FieldValues>({
  schema,
  defaultValues,
  fields,
  onSubmit,
  submitLabel = "Submit",
  loading = false,
  actions,
  testId = "form-kit"
}: FormKitProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const renderField = (field: FormField) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as any}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {renderFieldControl(field, formField)}
            </FormControl>
            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  const renderFieldControl = (field: FormField, formField: any) => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            {...formField}
            data-test-id={`${testId}-${field.name}`}
          />
        )
      
      case 'select':
        return (
          <Select onValueChange={formField.onChange} defaultValue={formField.value}>
            <SelectTrigger data-test-id={`${testId}-${field.name}`}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'switch':
        return (
          <Switch
            checked={formField.value}
            onCheckedChange={formField.onChange}
            data-test-id={`${testId}-${field.name}`}
          />
        )
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={formField.value}
              onCheckedChange={formField.onChange}
              data-test-id={`${testId}-${field.name}`}
            />
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </label>
          </div>
        )
      
      default:
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            {...formField}
            data-test-id={`${testId}-${field.name}`}
          />
        )
    }
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6"
        data-test-id={testId}
      >
        {fields.map(renderField)}
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={loading}
            data-test-id={`${testId}-submit`}
          >
            {loading ? 'Loading...' : submitLabel}
          </Button>
          {actions}
        </div>
      </form>
    </Form>
  )
}