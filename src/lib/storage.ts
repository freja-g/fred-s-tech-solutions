
import { supabase } from "@/integrations/supabase/client";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const uploadMedia = async (bucket: string, path: string, type: 'image' | 'video' | 'any' = 'image') => {
  try {
    // For large files and videos, using a standard input is often more reliable in hybrid apps
    // than converting to base64, which can crash the UI thread for 50MB files.

    return new Promise<string | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'image/*,video/*';

      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          alert("File is too large. Maximum size is 50MB.");
          resolve(null);
          return;
        }

        const fileName = `${path}/${Date.now()}_${file.name}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true
          });

        if (error) {
          console.error("Supabase upload error:", error);
          resolve(null);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        resolve(publicUrl);
      };

      input.click();
    });
  } catch (error) {
    console.error("Upload process failed", error);
    return null;
  }
};

// Keep legacy support for simple avatar captures if needed
export const captureAndUploadImage = async (bucket: string, path: string) => {
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
    console.error("Capture failed", error);
    return null;
  }
};
