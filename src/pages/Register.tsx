import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Link } from '@mui/material'
import { z } from 'zod'
import { client } from '@/api/client'
import { useAuthStore } from '@/store/auth'

const schema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(1) })

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const setAuth = useAuthStore(s => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    const parsed = schema.safeParse({ email, password, name })
    if (!parsed.success) {
      setError(parsed.error.errors.map(e => e.message).join(', '))
      return
    }
    setLoading(true)
    try {
      const res = await client.post('/auth/register', { email, password, name })
      const { token, _id, email: em, name: nm } = res.data.data
      setAuth({ token, user: { _id, email: em } })
      navigate('/')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxWidth={420} mx="auto" mt={6}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Register</Typography>
          <Stack spacing={2}>
            <TextField label="Name" value={name} onChange={e => setName(e.target.value)} />
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>Create Account</Button>
            </Stack>
            <Typography variant="body2">Have an account? <Link component={RouterLink} to="/login">Login</Link></Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}


