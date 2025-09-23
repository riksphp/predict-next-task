export interface GeneratedNote {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: string;
  basedOn: {
    predictedTasks: string[];
    completedTasks: string[];
    conversationTopics: string[];
  };
}

const NOTES_STORAGE_KEY = 'nextTaskPredictor_generatedNotes';

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getGeneratedNotes(): Promise<GeneratedNote[]> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get(
          [NOTES_STORAGE_KEY],
          (result: Record<string, unknown>) => {
            resolve((result[NOTES_STORAGE_KEY] as GeneratedNote[]) || []);
          },
        );
      });
    }
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveGeneratedNote(note: GeneratedNote): Promise<void> {
  const existingNotes = await getGeneratedNotes();
  const updatedNotes = [note, ...existingNotes]; // Add new note at the beginning

  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.set({ [NOTES_STORAGE_KEY]: updatedNotes }, () => {
          resolve();
        });
      });
    }
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Failed to save generated note:', error);
  }
}

export async function deleteGeneratedNote(noteId: string): Promise<void> {
  const existingNotes = await getGeneratedNotes();
  const updatedNotes = existingNotes.filter((note) => note.id !== noteId);

  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.set({ [NOTES_STORAGE_KEY]: updatedNotes }, () => {
          resolve();
        });
      });
    }
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Failed to delete generated note:', error);
  }
}

export async function clearAllGeneratedNotes(): Promise<void> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.set({ [NOTES_STORAGE_KEY]: [] }, () => {
          resolve();
        });
      });
    }
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Failed to clear generated notes:', error);
  }
}

export function generateNoteId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
