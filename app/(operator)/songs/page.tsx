'use client'

import { useEffect } from 'react'
import { useSongsStore } from '@/stores/songs.store'
import { SongToolbar } from './_components/SongToolbar'
import { SongTable } from './_components/SongTable'
import { SongEditorSheet } from './_components/SongEditorSheet'
import { VirtualSongList } from '@/components/songs/VirtualSongList'

const VIRTUAL_THRESHOLD = 200  // use virtual list beyond this count

export default function SongsPage() {
  const { fetchSongs, isLoading, songs } = useSongsStore()

  useEffect(() => {
    fetchSongs()
  }, [fetchSongs])

  const useVirtual = songs.length >= VIRTUAL_THRESHOLD

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SongToolbar />
      <div className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : useVirtual ? (
          <VirtualSongList />
        ) : (
          <SongTable />
        )}
      </div>
      <SongEditorSheet />
    </div>
  )
}
