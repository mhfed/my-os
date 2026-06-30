export interface Note {
  id: string;
  userId?: string;
  title: string;
  content: string;
  tags: string[];
  isReadingList: boolean;
  url?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NoteState {
  notes: Note[];
  ready: boolean;

  init: () => Promise<void>;
  saveNote: (
    input: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'tags'> & {
      id?: string;
      tags?: string[];
    },
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}
