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
  const { addPilot } = usePilots()
  const [previewUrl, setPreviewUrl] = useState('')

  const form = useForm<PilotInput>({
    resolver: zodResolver(pilotSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white">Pilot Name</Label>
        <Input 
          id="name" 
          {...form.register('name')} 
          placeholder="z.B. Max Mustermann"
          className="bg-black/50 border-neon-pink/50 text-white placeholder:text-gray-500" 
        />
        {form.formState.errors.name && (
          <p className="text-red-400 text-sm">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="text-white">Bild URL</Label>
        <Input 
          id="imageUrl" 
          {...form.register('imageUrl')} 
          placeholder="https://example.com/pilot.jpg"
          className="bg-black/50 border-neon-pink/50 text-white placeholder:text-gray-500" 
        />
        {form.formState.errors.imageUrl && (
          <p className="text-red-400 text-sm">{form.formState.errors.imageUrl.message}</p>
        )}
      </div>
      {previewUrl && (
        <div className="flex justify-center">
          <img 
            src={previewUrl} 
            alt="Vorschau" 
            className="w-24 h-24 object-cover rounded-lg border-2 border-neon-pink/50" 
            onError={() => setPreviewUrl('')} 
          />
        </div>
      )}
      <Button 
        type="submit" 
        className="w-full bg-neon-pink hover:bg-glow-pink text-black font-bold"
      >
        Pilot Hinzufügen
      </Button>
    </form>
  )
}