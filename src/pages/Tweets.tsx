import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { client, BACKEND_BASE } from '@/api/client'
import { Box, Button, Card, CardContent, Grid, Stack, Typography, Chip, CircularProgress, Divider } from '@mui/material'
import { io, Socket } from 'socket.io-client'
import { FileText, Clock, CheckCircle, Image as ImageIcon, MessageCircle, TrendingUp } from 'lucide-react'
import EnhancedTweetComposer from '../components/EnhancedTweetComposer'

type Tweet = { 
  _id: string
  content: string
  status: 'draft'|'scheduled'|'posted'
  scheduledAt: string
  media?: string[]
  likes?: number
  retweets?: number
  impressions?: number
}

const TweetCard = ({ tweet, onDelete, onSimulatePost }: { tweet: Tweet; onDelete: (id: string) => void; onSimulatePost: (id: string) => void }) => {
  const getStatusIcon = () => {
    switch (tweet.status) {
      case 'draft': return <FileText size={16} />
      case 'scheduled': return <Clock size={16} />
      case 'posted': return <CheckCircle size={16} />
      default: return <FileText size={16} />
    }
  }

  const getStatusColor = () => {
    switch (tweet.status) {
      case 'draft': return 'default'
      case 'scheduled': return 'primary'
      case 'posted': return 'success'
      default: return 'default'
    }
  }

  return (
    <Box sx={{ 
      border: '1px solid', 
      borderColor: 'divider', 
      p: 2, 
      borderRadius: 2,
      backgroundColor: 'background.paper'
    }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        {getStatusIcon()}
        <Chip 
          label={tweet.status} 
          size="small" 
          color={getStatusColor()}
        />
        <Typography variant="caption" sx={{ ml: 'auto' }}>
          {new Date(tweet.scheduledAt).toLocaleString()}
        </Typography>
      </Box>
      
      <Typography variant="body1" sx={{ mb: 1 }}>
        {tweet.content}
      </Typography>
      
      {/* Show media images */}
      {(tweet.media?.length ?? 0) > 0 && (
        <Stack direction="row" spacing={1} mb={1}>
          {Array.isArray(tweet.media) && tweet.media.map((url, idx) => (
            <Box key={idx} sx={{ 
              width: 80, 
              height: 80, 
              overflow: 'hidden', 
              borderRadius: 1, 
              border: '1px solid #eee',
              position: 'relative'
            }}>
              <img
                src={`${BACKEND_BASE}${url}`}
                alt="tweet media"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: '50%',
                  p: 0.5
                }}
              >
                <ImageIcon size={12} color="white" />
              </Box>
            </Box>
          ))}
        </Stack>
      )}
      
      {/* Performance metrics for posted tweets */}
      {tweet.status === 'posted' && (
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <MessageCircle size={14} />
            <Typography variant="caption">{tweet.impressions || 0}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <TrendingUp size={14} />
            <Typography variant="caption">{tweet.likes || 0}</Typography>
          </Box>
        </Box>
      )}
      
      <Stack direction="row" spacing={1}>
        {tweet.status !== 'posted' && (
          <Button 
            size="small" 
            color="success" 
            onClick={() => onSimulatePost(tweet._id)}
            variant="outlined"
          >
            Simulate Post
          </Button>
        )}
        <Button 
          size="small" 
          color="error" 
          onClick={() => onDelete(tweet._id)}
          variant="outlined"
        >
          Delete
        </Button>
      </Stack>
    </Box>
  )
}

export default function Tweets() {
  const qc = useQueryClient()
  
  const { data: tweets, isLoading, refetch, error } = useQuery({ 
    queryKey: ['tweets'], 
    queryFn: async () => (await client.get('/tweets')).data.data as Tweet[]
  })

  useEffect(() => {
    const socket: Socket = io(BACKEND_BASE)
    socket.on('tweet:posted', () => qc.invalidateQueries({ queryKey: ['tweets'] }))
    socket.on('tweet:scheduled', () => qc.invalidateQueries({ queryKey: ['tweets'] }))
    socket.on('tweet:deleted', () => qc.invalidateQueries({ queryKey: ['tweets'] }))
    return () => { socket.close() }
  }, [qc])

  const handleDelete = async (id: string) => { 
    await client.delete(`/tweets/${id}`)
    await refetch() 
  }

  const handleSimulatePost = async (id: string) => {
    await client.post(`/tweets/${id}/simulate`)
    await refetch()
  }

  const groupedTweets = tweets?.reduce((acc, tweet) => {
    if (!acc[tweet.status]) acc[tweet.status] = []
    acc[tweet.status].push(tweet)
    return acc
  }, {} as Record<string, Tweet[]>) || {}

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">
          Error loading tweets. Please try again.
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={6}>
        <EnhancedTweetComposer />
      </Grid>
      
      <Grid item xs={12} lg={6}>
        <Card sx={{ height: '80vh', overflow: 'hidden' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ flexShrink: 0 }}>
              My Tweets ({tweets?.length || 0})
            </Typography>
            
            <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
              <Stack spacing={2}>
                {/* Drafts */}
                {groupedTweets.draft && groupedTweets.draft.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Drafts ({groupedTweets.draft.length})
                    </Typography>
                    <Stack spacing={1}>
                      {groupedTweets.draft.map(tweet => (
                        <TweetCard key={tweet._id} tweet={tweet} onDelete={handleDelete} onSimulatePost={handleSimulatePost} />
                      ))}
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                  </Box>
                )}
                
                {/* Scheduled */}
                {groupedTweets.scheduled && groupedTweets.scheduled.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Scheduled ({groupedTweets.scheduled.length})
                    </Typography>
                    <Stack spacing={1}>
                      {groupedTweets.scheduled.map(tweet => (
                        <TweetCard key={tweet._id} tweet={tweet} onDelete={handleDelete} onSimulatePost={handleSimulatePost} />
                      ))}
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                  </Box>
                )}
                
                {/* Posted */}
                {groupedTweets.posted && groupedTweets.posted.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Posted ({groupedTweets.posted.length})
                    </Typography>
                    <Stack spacing={1}>
                      {groupedTweets.posted.map(tweet => (
                        <TweetCard key={tweet._id} tweet={tweet} onDelete={handleDelete} onSimulatePost={handleSimulatePost} />
                      ))}
                    </Stack>
                  </Box>
                )}
                
                {(!tweets || tweets.length === 0) && (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" color="text.secondary">
                      No tweets yet. Create your first tweet!
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}


