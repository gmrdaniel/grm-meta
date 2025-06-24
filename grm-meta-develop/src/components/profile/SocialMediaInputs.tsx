
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SocialMediaInputsProps {
  formData: {
    instagram_username: string;
    instagram_followers: string;
    tiktok_username: string;
    tiktok_followers: string;
    youtube_username: string;
    youtube_followers: string;
    pinterest_username: string;
    pinterest_followers: string;
    primary_social_network: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRadioChange: (value: string) => void;
}

export const SocialMediaInputs = ({
  formData,
  handleInputChange,
  handleRadioChange
}: SocialMediaInputsProps) => {
  console.log("SocialMediaInputs - primary_social_network:", formData.primary_social_network);
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Redes Sociales</h2>
      
      <div className="grid grid-cols-12 gap-4 items-center mb-4">
        <div className="col-span-3">
          <Label className="font-medium">Red Social</Label>
        </div>
        <div className="col-span-5">
          <Label className="font-medium">Usuario</Label>
        </div>
        <div className="col-span-3">
          <Label className="font-medium">Seguidores</Label>
        </div>
        <div className="col-span-1">
          <Label className="font-medium">Principal</Label>
        </div>
      </div>
      
      <RadioGroup 
        value={formData.primary_social_network || ""}
        onValueChange={handleRadioChange} 
        className="flex flex-col space-y-4"
      >
        {/* Instagram Row */}
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-3">
            <Label htmlFor="instagram_username" className="font-medium">Instagram</Label>
          </div>
          <div className="col-span-5">
            <Input id="instagram_username" name="instagram_username" value={formData.instagram_username} onChange={handleInputChange} placeholder="@usuario" />
          </div>
          <div className="col-span-3">
            <Input id="instagram_followers" name="instagram_followers" type="number" value={formData.instagram_followers} onChange={handleInputChange} placeholder="0" />
          </div>
          <div className="col-span-1 flex justify-center">
            <RadioGroupItem value="instagram" id="instagram" disabled={!formData.instagram_username} />
          </div>
        </div>

        {/* TikTok Row */}
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-3">
            <Label htmlFor="tiktok_username" className="font-medium">TikTok</Label>
          </div>
          <div className="col-span-5">
            <Input id="tiktok_username" name="tiktok_username" value={formData.tiktok_username} onChange={handleInputChange} placeholder="@usuario" />
          </div>
          <div className="col-span-3">
            <Input id="tiktok_followers" name="tiktok_followers" type="number" value={formData.tiktok_followers} onChange={handleInputChange} placeholder="0" />
          </div>
          <div className="col-span-1 flex justify-center">
            <RadioGroupItem value="tiktok" id="tiktok" disabled={!formData.tiktok_username} />
          </div>
        </div>

        {/* YouTube Row */}
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-3">
            <Label htmlFor="youtube_username" className="font-medium">YouTube</Label>
          </div>
          <div className="col-span-5">
            <Input id="youtube_username" name="youtube_username" value={formData.youtube_username} onChange={handleInputChange} placeholder="@usuario" />
          </div>
          <div className="col-span-3">
            <Input id="youtube_followers" name="youtube_followers" type="number" value={formData.youtube_followers} onChange={handleInputChange} placeholder="0" />
          </div>
          <div className="col-span-1 flex justify-center">
            <RadioGroupItem value="youtube" id="youtube" disabled={!formData.youtube_username} />
          </div>
        </div>

        {/* Pinterest Row */}
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-3">
            <Label htmlFor="pinterest_username" className="font-medium">Pinterest</Label>
          </div>
          <div className="col-span-5">
            <Input id="pinterest_username" name="pinterest_username" value={formData.pinterest_username} onChange={handleInputChange} placeholder="@usuario" />
          </div>
          <div className="col-span-3">
            <Input id="pinterest_followers" name="pinterest_followers" type="number" value={formData.pinterest_followers} onChange={handleInputChange} placeholder="0" />
          </div>
          <div className="col-span-1 flex justify-center">
            <RadioGroupItem value="pinterest" id="pinterest" disabled={!formData.pinterest_username} />
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};
