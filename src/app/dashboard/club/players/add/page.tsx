'use client';
import { Suspense } from 'react';
import SharedPlayerForm from '../../../shared/player-form/page';
import { useSearchParams } from 'next/navigation';

function AddClubPlayerContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const mode = editId ? 'edit' : 'add';

  return <SharedPlayerForm mode={mode} accountType="club" playerId={editId || undefined} />;
}

export default function AddClubPlayer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddClubPlayerContent />
    </Suspense>
  );
} 
