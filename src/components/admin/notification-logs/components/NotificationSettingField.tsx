
// import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Control, useWatch } from "react-hook-form";
// import { NotificationLogFormValues } from "../schemas/notificationLogFormSchema";
// import { useNotificationSettings } from "../hooks/useNotificationSettings";
// import { LoadingSpinner } from "@/components/auth/LoadingSpinner";

// interface NotificationSettingFieldProps {
//   control: Control<NotificationLogFormValues>;
// }

// export function NotificationSettingField({ control }: NotificationSettingFieldProps) {
//   const { data: settings, isLoading } = useNotificationSettings();
//   const channel = useWatch({ control, name: "channel" });
  
//   const filteredSettings = settings?.filter(setting => 
//     channel ? setting.channel === channel : true
//   );

//   if (isLoading) {
//     return <div className="h-10 flex items-center"><LoadingSpinner /></div>;
//   }

//   return (
//     <FormField
//       control={control}
//       name="notification_setting_id"
//       render={({ field }) => (
//         <FormItem>
//           <FormLabel>Notification Setting</FormLabel>
//           <Select onValueChange={field.onChange} defaultValue={field.value}>
//             <FormControl>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select a notification setting" />
//               </SelectTrigger>
//             </FormControl>
//             <SelectContent>
//               {filteredSettings?.map((setting) => (
//                 <SelectItem key={setting.id} value={setting.id}>
//                   {setting.type} ({setting.message.substring(0, 30)}...)
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