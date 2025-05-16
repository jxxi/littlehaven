import EmojiPicker from './EmojiPicker';

export function ReactionPicker({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  // EmojiPicker expects setMessage, so we intercept it
  return (
    <EmojiPicker
      message=""
      setMessage={(emoji) => {
        if (typeof emoji === 'string') onSelect(emoji);
        else if (emoji && emoji.emoji) onSelect(emoji.emoji);
      }}
    />
  );
}
