import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pilotSchema, type PilotInput } from '../lib/schemas'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { usePilots } from '../hooks/usePilots'

type AddPilotFormProps = {
  onSuccess?: () => void
}

export function AddPilotForm({ onSuccess }: AddPilotFormProps) {
  const { addPilot, pilots } = usePilots()
  const [previewUrl, setPreviewUrl] = useState('')

  const form = useForm<PilotInput>({
    resolver: zodResolver(pilotSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
      instagramHandle: '',
    },
  })

  const onSubmit = (data: PilotInput) => {
    const success = addPilot(data)
    if (success) {
      form.reset()
      setPreviewUrl('')
      onSuccess?.()
    }
  }

  // Keyboard: Enter=Submit, ESC=Cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        form.reset()
        setPreviewUrl('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [form])

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.imageUrl) {
        setPreviewUrl(value.imageUrl)
      } else {
        setPreviewUrl('')
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Edge Cases: MAX 35 → Disable Add
  const isMaxPilotsReached = pilots.length >= 35

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-ui">
      <div className="space-y-3">
        <Label htmlFor="name" className="text-chrome text-lg font-semibold">Pilot Name</Label>
        <Input 
          id="name" 
          {...form.register('name')} 
          placeholder="z.B. Max Mustermann"
          className="bg-night/50 border-steel text-chrome placeholder:text-steel focus:border-neon-pink focus:shadow-glow-pink font-ui" 
        />
        {form.formState.errors.name && (
          <p className="text-loser-red text-sm font-ui">{form.formState.errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="imageUrl" className="text-chrome text-lg font-semibold">Bild URL</Label>
        <Input 
          id="imageUrl" 
          {...form.register('imageUrl')} 
          placeholder="https://example.com/pilot.jpg"
          className="bg-night/50 border-steel text-chrome placeholder:text-steel focus:border-neon-pink focus:shadow-glow-pink font-ui" 
        />
        {form.formState.errors.imageUrl && (
          <p className="text-loser-red text-sm font-ui">{form.formState.errors.imageUrl.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label htmlFor="instagramHandle" className="text-chrome text-lg font-semibold">
          Instagram <span className="text-steel font-normal">(optional)</span>
        </Label>
        <Input 
          id="instagramHandle" 
          {...form.register('instagramHandle')} 
          placeholder="@pilot_fpv"
          className="bg-night/50 border-steel text-chrome placeholder:text-steel focus:border-neon-cyan focus:shadow-glow-cyan font-ui" 
        />
        {form.formState.errors.instagramHandle && (
          <p className="text-loser-red text-sm font-ui">{form.formState.errors.instagramHandle.message}</p>
        )}
      </div>

      {/* Live-Vorschau */}
      {previewUrl && (
        <div className="flex justify-center">
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Vorschau" 
              className="w-30 h-30 object-cover rounded-full border-3 border-neon-pink shadow-glow-pink" 
              onError={() => setPreviewUrl('')} 
            />
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={isMaxPilotsReached}
        className="w-full bg-neon-pink hover:shadow-glow-pink text-void font-display text-xl font-bold py-6 disabled:bg-steel disabled:shadow-none transition-all duration-200"
      >
        {isMaxPilotsReached ? 'Max. 35 Piloten erreicht' : 'PILOT HINZUFÜGEN'}
      </Button>

      {/* Edge Case: 0 Piloten → Warnung */}
      {pilots.length === 0 && (
        <div className="text-center text-steel text-sm font-ui">
          Mindestens 7 Piloten für Turnier erforderlich
        </div>
      )}
    </form>
  )
}