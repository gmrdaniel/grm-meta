
// import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Control } from "react-hook-form";
// import { NotificationLogFormValues } from "../schemas/notificationLogFormSchema";
// import { useInvitations } from "../hooks/useInvitations";
// import { LoadingSpinner } from "@/components/auth/LoadingSpinner";

// interface RecipientFieldProps {
//   control: Control<NotificationLogFormValues>;
// }

// export function RecipientField({ control }: RecipientFieldProps) {
//   const { data: invitations, isLoading } = useInvitations();

//   if (isLoading) {
//     return <div className="h-10 flex items-center"><LoadingSpinner /></div>;
//   }

//   return (
//     <FormField
//       control={control}
//       name="invitation_id"
//       render={({ field }) => (
//         <FormItem>
//           <FormLabel>Recipient</FormLabel>
//           <Select onValueChange={field.onChange} defaultValue={field.value}>
//             <FormControl>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select a recipient" />
//               </SelectTrigger>
//             </FormControl>
//             <SelectContent>
//               {invitations?.map((invitation) => (
//                 <SelectItem key={invitation.id} value={invitation.id}>
//                   {invitation.full_name} ({invitation.email})
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   );
// }