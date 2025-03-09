
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
  handleRadioChange,
}: SocialMediaInputsProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Redes Sociales</h2>
      <div className="mb-4">
        <Label className="mb-2 block">Red Social Principal</Label>
        <RadioGroup 
          value={formData.primary_social_network} 
          onValueChange={handleRadioChange}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="instagram" id="instagram" disabled={!formData.instagram_username} />
            <Label htmlFor="instagram" className={!formData.instagram_username ? "text-gray-400" : ""}>
              Instagram
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tiktok" id="tiktok" disabled={!formData.tiktok_username} />
            <Label htmlFor="tiktok" className={!formData.tiktok_username ? "text-gray-400" : ""}>
              TikTok
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="youtube" id="youtube" disabled={!formData.youtube_username} />
            <Label htmlFor="youtube" className={!formData.youtube_username ? "text-gray-400" : ""}>
              YouTube
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pinterest" id="pinterest" disabled={!formData.pinterest_username} />
            <Label htmlFor="pinterest" className={!formData.pinterest_username ? "text-gray-400" : ""}>
              Pinterest
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="instagram_username">Usuario de Instagram</Label>
          <Input
            id="instagram_username"
            name="instagram_username"
            value={formData.instagram_username}
            onChange={handleInputChange}
            placeholder="@usuario"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram_followers">Seguidores en Instagram</Label>
          <Input
            id="instagram_followers"
            name="instagram_followers"
            type="number"
            value={formData.instagram_followers}
            onChange={handleInputChange}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tiktok_username">Usuario de TikTok</Label>
          <Input
            id="tiktok_username"
            name="tiktok_username"
            value={formData.tiktok_username}
            onChange={handleInputChange}
            placeholder="@usuario"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tiktok_followers">Seguidores en TikTok</Label>
          <Input
            id="tiktok_followers"
            name="tiktok_followers"
            type="number"
            value={formData.tiktok_followers}
            onChange={handleInputChange}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="youtube_username">Usuario de YouTube</Label>
          <Input
            id="youtube_username"
            name="youtube_username"
            value={formData.youtube_username}
            onChange={handleInputChange}
            placeholder="@usuario"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtube_followers">Seguidores en YouTube</Label>
          <Input
            id="youtube_followers"
            name="youtube_followers"
            type="number"
            value={formData.youtube_followers}
            onChange={handleInputChange}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pinterest_username">Usuario de Pinterest</Label>
          <Input
            id="pinterest_username"
            name="pinterest_username"
            value={formData.pinterest_username}
            onChange={handleInputChange}
            placeholder="@usuario"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pinterest_followers">Seguidores en Pinterest</Label>
          <Input
            id="pinterest_followers"
            name="pinterest_followers"
            type="number"
            value={formData.pinterest_followers}
            onChange={handleInputChange}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};
