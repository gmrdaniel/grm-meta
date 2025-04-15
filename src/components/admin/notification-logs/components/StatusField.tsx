
// import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Control } from "react-hook-form";
// import { NotificationLogFormValues } from "../schemas/notificationLogFormSchema";

// interface StatusFieldProps {
//   control: Control<NotificationLogFormValues>;
// }

// export function StatusField({ control }: StatusFieldProps) {
//   return (
//     <FormField
//       control={control}
//       name="status"
//       render={({ field }) => (
//         <FormItem>
//           <FormLabel>Status</FormLabel>
//           <Select onValueChange={field.onChange} defaultValue={field.value}>
//             <FormControl>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select a status" />
//               </SelectTrigger>
//             </FormControl>
//             <SelectContent>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="sent">Sent</SelectItem>
//               <SelectItem value="failed">Failed</SelectItem>
//             </SelectContent>
//           </Select>
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   );
// }