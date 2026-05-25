
import { supabase } from "@/integrations/supabase/client";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export const uploadImage = async (bucket: string, path: string) => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt
    });

    if (!image.base64String) return null;

    const fileName = `${path}/${Date.now()}.jpg`;
    const byteCharacters = atob(image.base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/jpeg" });

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, { contentType: 'image/jpeg' });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error("Upload failed", error);
    return null;
  }
};
