import React, { useState, useCallback, useMemo } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { client } from '@/api/client'
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Stack,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material'
import { 
  Edit, 
  Delete, 
  Clock, 
  CheckCircle, 
  FileText, 
  Image as ImageIcon,
  TrendingUp,
  MessageCircle
} from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {}
})

type Tweet = {
  _id: string
  content: string
  status: 'draft' | 'scheduled' | 'posted'
  scheduledAt: string
  media?: string[]
  likes?: number
  retweets?: number
  impressions?: number
}

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource: Tweet
}

const getEventStyle = (event: CalendarEvent) => {
  const { status } = event.resource
  const baseStyle = {
    borderRadius: '8px',
    border: 'none',
    color: 'white',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 'bold'
  }

  switch (status) {
    case 'draft':
      return { ...baseStyle, backgroundColor: '#6c757d' }
    case 'scheduled':
      return { ...baseStyle, backgroundColor: '#007bff' }
    case 'posted':
      return { ...baseStyle, backgroundColor: '#28a745' }
    default:
      return { ...baseStyle, backgroundColor: '#6c757d' }
  }
}

const EventComponent = ({ event }: { event: CalendarEvent }) => {
  const { resource } = event
  const [showDetails, setShowDetails] = useState(false)

  const getStatusIcon = () => {
    switch (resource.status) {
      case 'draft': return <FileText size={12} />
      case 'scheduled': return <Clock size={12} />
      case 'posted': return <CheckCircle size={12} />
      default: return <FileText size={12} />
    }
  }

  return (
    <Box>
      <Box 
        display="flex" 
        alignItems="center" 
        gap={0.5}
        onClick={() => setShowDetails(true)}
        sx={{ cursor: 'pointer' }}
      >
        {getStatusIcon()}
        <Typography variant="caption" sx={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          maxWidth: '120px'
        }}>
          {resource.content}
        </Typography>
        {resource.media && resource.media.length > 0 && (
          <ImageIcon size={10} />
        )}
      </Box>
      
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {getStatusIcon()}
            <Typography variant="h6">Tweet Details</Typography>
            <Chip 
              label={resource.status} 
              size="small" 
              color={
                resource.status === 'posted' ? 'success' :
                resource.status === 'scheduled' ? 'primary' : 'default'
              }
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body1">{resource.content}</Typography>
            
            {resource.media && resource.media.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Media:</Typography>
                <Stack direction="row" spacing={1}>
                  {resource.media.map((url, idx) => (
                    <Box 
                      key={idx} 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: 1, 
                        overflow: 'hidden',
                        border: '1px solid #ddd'
                      }}
                    >
                      <img 
                        src={`http://localhost:5000${url}`} 
                        alt="tweet media"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>Schedule:</Typography>
              <Typography variant="body2">
                {format(new Date(resource.scheduledAt), 'MMMM do yyyy, h:mm:ss a')}
              </Typography>
            </Box>

            {resource.status === 'posted' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Performance:</Typography>
                <Stack direction="row" spacing={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <MessageCircle size={16} />
                    <Typography variant="body2">{resource.impressions || 0} impressions</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <TrendingUp size={16} />
                    <Typography variant="body2">{resource.likes || 0} likes</Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default function Calendar() {
  const [view, setView] = useState<string>(Views.MONTH)
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newScheduleTime, setNewScheduleTime] = useState('')
  
  const queryClient = useQueryClient()

  const { data: tweets, isLoading } = useQuery({
    queryKey: ['tweets'],
    queryFn: async () => (await client.get('/api/tweets')).data.data as Tweet[]
  })

  const updateTweetMutation = useMutation({
    mutationFn: async ({ id, scheduledAt }: { id: string; scheduledAt: string }) => {
      return client.put(`/api/tweets/${id}`, { scheduledAt })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] })
      setEditDialogOpen(false)
      setSelectedEvent(null)
    }
  })

  const deleteTweetMutation = useMutation({
    mutationFn: async (id: string) => {
      return client.delete(`/api/tweets/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] })
      setEditDialogOpen(false)
      setSelectedEvent(null)
    }
  })

  const events: CalendarEvent[] = useMemo(() => {
    if (!tweets) return []
    
    return tweets.map(tweet => ({
      id: tweet._id,
      title: tweet.content,
      start: new Date(tweet.scheduledAt),
      end: new Date(new Date(tweet.scheduledAt).getTime() + 30 * 60 * 1000), // 30 minutes duration
      resource: tweet
    }))
  }, [tweets])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
    setNewScheduleTime(format(event.start, 'yyyy-MM-dd\'T\'HH:mm'))
    setEditDialogOpen(true)
  }, [])

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    // This could be used to create new tweets at specific times
    console.log('Selected slot:', slotInfo)
  }, [])

  const handleEventDrop = useCallback(({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    const newScheduledAt = format(start, 'yyyy-MM-dd\'T\'HH:mm:ss')
    updateTweetMutation.mutate({ 
      id: event.id, 
      scheduledAt: newScheduledAt 
    })
  }, [updateTweetMutation])

  const handleEventResize = useCallback(({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    const newScheduledAt = format(start, 'yyyy-MM-dd\'T\'HH:mm:ss')
    updateTweetMutation.mutate({ 
      id: event.id, 
      scheduledAt: newScheduledAt 
    })
  }, [updateTweetMutation])

  const handleUpdateSchedule = () => {
    if (selectedEvent && newScheduleTime) {
      updateTweetMutation.mutate({
        id: selectedEvent.id,
        scheduledAt: newScheduleTime
      })
    }
  }

  const handleDeleteTweet = () => {
    if (selectedEvent) {
      deleteTweetMutation.mutate(selectedEvent.id)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading calendar...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Content Calendar</Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                icon={<FileText size={16} />} 
                label="Drafts" 
                size="small" 
                sx={{ backgroundColor: '#6c757d', color: 'white' }}
              />
              <Chip 
                icon={<Clock size={16} />} 
                label="Scheduled" 
                size="small" 
                sx={{ backgroundColor: '#007bff', color: 'white' }}
              />
              <Chip 
                icon={<CheckCircle size={16} />} 
                label="Posted" 
                size="small" 
                sx={{ backgroundColor: '#28a745', color: 'white' }}
              />
            </Stack>
          </Box>

          <Box sx={{ height: '600px' }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              resizable
              draggableAccessor={() => true}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              eventPropGetter={getEventStyle}
              components={{
                event: EventComponent
              }}
              popup
              showMultiDayTimes
              step={15}
              timeslots={4}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Tweet Schedule</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedEvent && (
              <>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  "{selectedEvent.resource.content}"
                </Typography>
                
                <TextField
                  label="New Schedule Time"
                  type="datetime-local"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                {updateTweetMutation.isError && (
                  <Alert severity="error">
                    Failed to update schedule. Please try again.
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            color="error" 
            onClick={handleDeleteTweet}
            disabled={deleteTweetMutation.isPending}
          >
            Delete Tweet
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateSchedule}
            disabled={updateTweetMutation.isPending || !newScheduleTime}
          >
            Update Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
