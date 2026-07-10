
import { supabase } from "@/integrations/supabase/client";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const sanitize = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");

export const uploadMedia = (
  bucket: string,
  path: string,
  type: 'image' | 'video' | 'any' = 'image'
): Promise<string | null> => {
  return new Promise<string | null>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept =
      type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'image/*,video/*';
    // Attach to DOM — some Android WebViews ignore .click() on detached inputs.
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);

    let done = false;
    const finish = (url: string | null) => {
      if (done) return;
      done = true;
      try { document.body.removeChild(input); } catch {}
      resolve(url);
    };

    input.onchange = async (e: any) => {
      const file: File | undefined = e.target.files?.[0];
      if (!file) return finish(null);

      if (file.size > MAX_FILE_SIZE) {
        alert("File is too large. Maximum size is 50MB.");
        return finish(null);
      }

      const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
      const base = sanitize(file.name.replace(/\.[^.]+$/, '')) || 'file';
      const fileName = `${path}/${Date.now()}_${base}${ext ? '.' + ext : ''}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });

      if (error) {
        console.error("Storage upload error:", error);
        alert(`Upload failed: ${error.message}`);
        return finish(null);
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      finish(publicUrl);
    };

    // Fallback: if the picker is cancelled we won't get a change event.
    // Detect via focus returning to the window.
    const onFocus = () => {
      setTimeout(() => {
        if (!input.files || input.files.length === 0) finish(null);
        window.removeEventListener('focus', onFocus);
      }, 500);
    };
    window.addEventListener('focus', onFocus);

    input.click();
  });
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
