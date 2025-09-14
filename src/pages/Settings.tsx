import { useState } from 'react'
import { client } from '@/api/client'
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'

export default function Settings() {
  const [timeZone, setTimeZone] = useState('')
  const [msg, setMsg] = useState('')
  const save = async () => {
    setMsg('')
    try {
      await client.put('/api/users/settings', { timeZone })
      setMsg('Saved')
    } catch (e: any) {
      setMsg(e?.response?.data?.message || 'Failed')
    }
  }
  return (
    <Box maxWidth={480}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Settings</Typography>
          <Stack spacing={2}>
            <TextField label="Time Zone" value={timeZone} onChange={e => setTimeZone(e.target.value)} placeholder="UTC or America/New_York" />
            <Button variant="contained" onClick={save}>Save</Button>
            {msg && <Typography variant="body2">{msg}</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}


