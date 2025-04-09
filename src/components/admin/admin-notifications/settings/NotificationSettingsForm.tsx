
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface NotificationSettingsFormProps {
  onSuccess: () => void;
}

export function NotificationSettingsForm({ onSuccess }: NotificationSettingsFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "notification",
    channel: "email",
    enabled: true,
    delay_days: 0,
    frequency_days: 1,
    max_notifications: 3,
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("notification_settings")
        .insert(formData);

      if (error) throw error;

      toast.success("Notification setting created successfully");
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
      onSuccess();
    } catch (error: any) {
      toast.error(`Error creating notification setting: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Notification Setting</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type">Notification Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select
                value={formData.channel}
                onValueChange={(value) => handleSelectChange("channel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Enabled</Label>
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => handleSwitchChange("enabled", checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject (Email only)</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delay_days">Delay (Days)</Label>
              <Input
                id="delay_days"
                name="delay_days"
                type="number"
                min="0"
                value={formData.delay_days}
                onChange={handleNumberChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency_days">Frequency (Days)</Label>
              <Input
                id="frequency_days"
                name="frequency_days"
                type="number"
                min="1"
                value={formData.frequency_days}
                onChange={handleNumberChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_notifications">Max Notifications</Label>
              <Input
                id="max_notifications"
                name="max_notifications"
                type="number"
                min="1"
                value={formData.max_notifications}
                onChange={handleNumberChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Notification message"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onSuccess}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Notification Setting"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
