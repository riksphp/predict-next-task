export function predictNextTask(context: string): string {
  const trimmed = (context || '').trim();
  return trimmed
    ? `Placeholder: Based on your context, start with a 15-minute planning pass on "${trimmed.slice(
        0,
        120,
      )}".`
    : 'Placeholder: Start by listing your top 3 outcomes for today.';
}
