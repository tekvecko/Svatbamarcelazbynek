import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CountdownTimer from '../client/src/components/countdown-timer'
import PhotoUpload from '../client/src/components/photo-upload'
import Playlist from '../client/src/components/playlist'
import AdminPanel from '../client/src/components/admin-panel'

// Mock hooks
vi.mock('../client/src/hooks/use-photos', () => ({
  useUploadPhotos: () => ({
    mutateAsync: vi.fn().mockResolvedValue([]),
    isPending: false
  }),
  usePhotos: () => ({
    data: [],
    isLoading: false
  }),
  useDeletePhoto: () => ({
    mutate: vi.fn()
  }),
  useApprovePhoto: () => ({
    mutate: vi.fn()
  })
}))

vi.mock('../client/src/hooks/use-playlist', () => ({
  usePlaylist: () => ({
    data: [],
    isLoading: false
  }),
  useAddSong: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false
  }),
  useToggleSongLike: () => ({
    mutate: vi.fn()
  })
}))

vi.mock('../client/src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

vi.mock('../client/src/lib/api', () => ({
  api: {
    getWeddingDetails: vi.fn().mockResolvedValue({
      id: 1,
      coupleNames: 'Test Couple',
      weddingDate: '2025-10-11T14:00:00',
      venue: 'Test Venue',
      allowUploads: true,
      moderateUploads: false
    }),
    updateWeddingDetails: vi.fn().mockResolvedValue({})
  }
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('CountdownTimer', () => {
  it('should display countdown for future date', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    
    render(<CountdownTimer targetDate={futureDate} />)
    
    expect(screen.getByText('Dní')).toBeInTheDocument()
    expect(screen.getByText('Hodin')).toBeInTheDocument()
    expect(screen.getByText('Minut')).toBeInTheDocument()
    expect(screen.getByText('Sekund')).toBeInTheDocument()
  })

  it('should display wedding day message for past date', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    
    render(<CountdownTimer targetDate={pastDate} />)
    
    expect(screen.getByText('🎉 Je to tady! 🎉')).toBeInTheDocument()
    expect(screen.getByText('Dnes je náš velký den!')).toBeInTheDocument()
  })

  it('should update countdown every second', async () => {
    vi.useFakeTimers()
    
    const futureDate = new Date()
    futureDate.setSeconds(futureDate.getSeconds() + 10)
    
    render(<CountdownTimer targetDate={futureDate} />)
    
    const initialSeconds = screen.getByText(/\d+/).textContent
    
    // Advance time by 1 second
    vi.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const newSeconds = screen.getByText(/\d+/).textContent
      expect(newSeconds).not.toBe(initialSeconds)
    })
    
    vi.useRealTimers()
  })
})

describe('PhotoUpload', () => {
  const Wrapper = createWrapper()

  it('should render upload interface', () => {
    render(<PhotoUpload />, { wrapper: Wrapper })
    
    expect(screen.getByText('Sdílejte své fotky!')).toBeInTheDocument()
    expect(screen.getByText('Nahrajte své nejlepší snímky ze svatby')).toBeInTheDocument()
    expect(screen.getByText('Vybrat fotky')).toBeInTheDocument()
    expect(screen.getByText('Nahrát')).toBeInTheDocument()
  })

  it('should enable upload button when files are selected', async () => {
    const user = userEvent.setup()
    
    render(<PhotoUpload />, { wrapper: Wrapper })
    
    const fileInput = screen.getByRole('button', { name: /vybrat fotky/i })
    const uploadButton = screen.getByRole('button', { name: /nahrát/i })
    
    expect(uploadButton).toBeDisabled()
    
    // Simulate file selection
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })
      
      fireEvent.change(input)
      
      await waitFor(() => {
        expect(screen.getByText('Vybráno 1 soubor')).toBeInTheDocument()
      })
    }
  })
})

describe('Playlist', () => {
  const Wrapper = createWrapper()

  it('should render playlist interface', () => {
    render(<Playlist />, { wrapper: Wrapper })
    
    expect(screen.getByText('Navrhněte skladbu, kterou byste rádi slyšeli na svatbě!')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Název skladby nebo interpret...')).toBeInTheDocument()
    expect(screen.getByText('Přidat')).toBeInTheDocument()
  })

  it('should add song when form is submitted', async () => {
    const user = userEvent.setup()
    
    render(<Playlist />, { wrapper: Wrapper })
    
    const input = screen.getByPlaceholderText('Název skladby nebo interpret...')
    const addButton = screen.getByRole('button', { name: /přidat/i })
    
    await user.type(input, 'Queen - Bohemian Rhapsody')
    await user.click(addButton)
    
    expect(input).toHaveValue('')
  })

  it('should show empty state when no songs', () => {
    render(<Playlist />, { wrapper: Wrapper })
    
    expect(screen.getByText('Zatím žádné návrhy. Přidejte první skladbu!')).toBeInTheDocument()
  })
})

describe('AdminPanel', () => {
  const Wrapper = createWrapper()

  it('should show login form when not authenticated', () => {
    render(<AdminPanel isOpen={true} onClose={() => {}} />, { wrapper: Wrapper })
    
    expect(screen.getByText('Admin heslo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Zadejte heslo')).toBeInTheDocument()
    expect(screen.getByText('Přihlásit se')).toBeInTheDocument()
  })

  it('should authenticate with correct password', async () => {
    const user = userEvent.setup()
    
    render(<AdminPanel isOpen={true} onClose={() => {}} />, { wrapper: Wrapper })
    
    const passwordInput = screen.getByPlaceholderText('Zadejte heslo')
    const loginButton = screen.getByRole('button', { name: /přihlásit se/i })
    
    await user.type(passwordInput, 'admin123')
    await user.click(loginButton)
    
    await waitFor(() => {
      expect(screen.getByText('Detaily svatby')).toBeInTheDocument()
    })
  })

  it('should show admin interface after authentication', async () => {
    const user = userEvent.setup()
    
    render(<AdminPanel isOpen={true} onClose={() => {}} />, { wrapper: Wrapper })
    
    // Login first
    const passwordInput = screen.getByPlaceholderText('Zadejte heslo')
    await user.type(passwordInput, 'admin123')
    await user.click(screen.getByRole('button', { name: /přihlásit se/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Detaily svatby')).toBeInTheDocument()
      expect(screen.getByText('Správa fotek')).toBeInTheDocument()
      expect(screen.getByText('Nastavení')).toBeInTheDocument()
    })
  })

  it('should update wedding details', async () => {
    const user = userEvent.setup()
    
    render(<AdminPanel isOpen={true} onClose={() => {}} />, { wrapper: Wrapper })
    
    // Login first
    const passwordInput = screen.getByPlaceholderText('Zadejte heslo')
    await user.type(passwordInput, 'admin123')
    await user.click(screen.getByRole('button', { name: /přihlásit se/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Detaily svatby')).toBeInTheDocument()
    })
    
    // Update couple names
    const coupleNamesInput = screen.getByDisplayValue('Test Couple')
    await user.clear(coupleNamesInput)
    await user.type(coupleNamesInput, 'New Couple')
    
    const updateButton = screen.getByRole('button', { name: /aktualizovat/i })
    await user.click(updateButton)
    
    expect(coupleNamesInput).toHaveValue('New Couple')
  })

  it('should toggle settings switches', async () => {
    const user = userEvent.setup()
    
    render(<AdminPanel isOpen={true} onClose={() => {}} />, { wrapper: Wrapper })
    
    // Login first
    const passwordInput = screen.getByPlaceholderText('Zadejte heslo')
    await user.type(passwordInput, 'admin123')
    await user.click(screen.getByRole('button', { name: /přihlásit se/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Nastavení')).toBeInTheDocument()
    })
    
    const allowUploadsSwitch = screen.getByRole('switch', { name: /povolit nahrávání fotek/i })
    const moderateUploadsSwitch = screen.getByRole('switch', { name: /moderovat před zveřejněním/i })
    
    expect(allowUploadsSwitch).toBeChecked()
    expect(moderateUploadsSwitch).not.toBeChecked()
    
    await user.click(allowUploadsSwitch)
    await user.click(moderateUploadsSwitch)
    
    expect(allowUploadsSwitch).not.toBeChecked()
    expect(moderateUploadsSwitch).toBeChecked()
  })
})