import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Link } from '@mui/material'
import { z } from 'zod'
import { client, BACKEND_BASE } from '@/api/client'
import { useAuthStore } from '@/store/auth'

const schema = z.object({ email: z.string().email(), password: z.string().min(6) })

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    const parsed = schema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.errors.map(e => e.message).join(', '))
      return
    }
    setLoading(true)
    try {
      const res = await client.post('/auth/login', { email, password })
      const { token, _id, email: em, name } = res.data.data
      console.log(res.data.data);
      setAuth({ token, user: { _id, email: em, name } })
      navigate('/')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const redirect = `${window.location.origin}/oauth/callback`
  const googleUrl = `${BACKEND_BASE}/api/auth/google?redirect=${encodeURIComponent(redirect)}`

  return (
    <Box maxWidth={420} mx="auto" mt={6}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Login</Typography>
          <Stack spacing={2}>
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>Login</Button>
              <Button variant="outlined" component={Link} href={googleUrl}>Google</Button>
            </Stack>
            <Typography variant="body2">No account? <Link component={RouterLink} to="/register">Register</Link></Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}


