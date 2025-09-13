import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function OAuthCallback() {
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const token = params.get('token')
    const _id = params.get('_id')
    const email = params.get('email')
    const name = params.get('name') || undefined
    const avatar = params.get('avatar') || undefined
    if (token && _id && email) {
      setAuth({ token, user: { _id, email, name, avatar } })
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [setAuth, navigate])
  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight={240} gap={2}>
      <CircularProgress size={24} />
      <Typography>Signing you in…</Typography>
    </Box>
  )
}


