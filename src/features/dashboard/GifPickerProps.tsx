export interface Gif {
  id: string;
  url: string;
  preview: string;
}
export interface GifPickerProps {
  onSelect: (gif: { url: string; preview: string }) => void;
  onClose: () => void;
}
