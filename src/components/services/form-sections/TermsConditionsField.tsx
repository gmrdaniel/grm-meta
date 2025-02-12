
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "../ServiceForm";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface TermsConditionsFieldProps {
  form: UseFormReturn<ServiceFormValues>;
}

export function TermsConditionsField({ form }: TermsConditionsFieldProps) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['list', 'bullet'],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet'
  ];

  return (
    <FormField
      control={form.control}
      name="terms_conditions"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Terms & Conditions</FormLabel>
          <FormControl>
            <div className="h-[300px] bg-white rounded-md border">
              <ReactQuill
                theme="snow"
                value={field.value || ''}
                onChange={field.onChange}
                modules={modules}
                formats={formats}
                className="h-[250px]"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
