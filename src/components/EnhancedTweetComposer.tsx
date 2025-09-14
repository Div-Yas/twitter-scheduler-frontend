import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Stack, 
  Box, 
  Typography, 
  Chip, 
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { 
  Send, 
  Image as ImageIcon, 
  Hash, 
  Sparkles, 
  Calendar,
  TrendingUp,
  X,
  Plus,
  Clock,
  Target
} from 'lucide-react'
import { client } from '@/api/client'

type Suggestion = {
  content: string
  hashtags?: string[]
}

type TrendingTopic = {
  name: string
  volume: number
}

const MAX_CHARACTERS = 280
const CHARACTER_WARNING_THRESHOLD = 260

const CharacterCounter = ({ count }: { count: number }) => {
  const getColor = () => {
    if (count > MAX_CHARACTERS) return 'error'
    if (count > CHARACTER_WARNING_THRESHOLD) return 'warning'
    return 'primary'
  }

  const getProgress = () => {
    return Math.min((count / MAX_CHARACTERS) * 100, 100)
  }

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Box sx={{ width: 60, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
        <Box 
          sx={{ 
            width: `${getProgress()}%`, 
            height: '100%', 
            backgroundColor: getColor() === 'error' ? '#f44336' : 
                           getColor() === 'warning' ? '#ff9800' : '#1976d2',
            transition: 'width 0.3s ease'
          }} 
        />
      </Box>
      <Typography 
        variant="caption" 
        color={getColor()}
        sx={{ minWidth: 40, textAlign: 'right' }}
      >
        {count}/{MAX_CHARACTERS}
      </Typography>
    </Box>
  )
}

const HashtagSuggestions = ({ 
  content, 
  onAddHashtag 
}: { 
  content: string
  onAddHashtag: (hashtag: string) => void 
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const generateHashtags = useCallback(async () => {
    if (!content.trim()) return
    
    setLoading(true)
    try {
      // Extract keywords from content
      const keywords = content
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 5)

      // Generate hashtag suggestions based on keywords
      const generatedHashtags = keywords.map(keyword => `#${keyword}`)
      
      // Add some trending hashtags (mock data)
      const trendingHashtags = [
        '#productivity', '#motivation', '#success', '#inspiration', 
        '#leadership', '#innovation', '#technology', '#business'
      ]
      
      const allSuggestions = [...generatedHashtags, ...trendingHashtags]
        .filter((hashtag, index, arr) => arr.indexOf(hashtag) === index)
        .slice(0, 8)

      setSuggestions(allSuggestions)
    } catch (error) {
      console.error('Error generating hashtags:', error)
    } finally {
      setLoading(false)
    }
  }, [content])

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Hash size={16} />
        <Typography variant="subtitle2">Hashtag Suggestions</Typography>
        <Button 
          size="small" 
          onClick={generateHashtags}
          disabled={loading || !content.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <Sparkles size={16} />}
        >
          Generate
        </Button>
      </Box>
      
      {suggestions.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
          {suggestions.map((hashtag, index) => (
            <Chip
              key={index}
              label={hashtag}
              size="small"
              onClick={() => onAddHashtag(hashtag)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}

const ContentSuggestions = ({ 
  onSelectSuggestion 
}: { 
  onSelectSuggestion: (suggestion: string) => void 
}) => {
  const [topic, setTopic] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const getSuggestions = useCallback(async () => {
    if (!topic.trim()) return
    
    setLoading(true)
    try {
      const response = await client.post('/api/ai/suggest', { topic })
      setSuggestions(response.data.data.suggestions || [])
      setDialogOpen(true)
    } catch (error) {
      console.error('Error getting suggestions:', error)
    } finally {
      setLoading(false)
    }
  }, [topic])

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Sparkles size={16} />
        <Typography variant="subtitle2">AI Content Suggestions</Typography>
        <TextField
          size="small"
          placeholder="Enter topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 200 }}
        />
        <Button 
          size="small" 
          onClick={getSuggestions}
          disabled={loading || !topic.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <Sparkles size={16} />}
        >
          Generate
        </Button>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Sparkles size={20} />
            Content Suggestions for "{topic}"
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {suggestions.map((suggestion, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => {
                  onSelectSuggestion(suggestion)
                  setDialogOpen(false)
                }}>
                  <ListItemText 
                    primary={suggestion}
                    secondary={`${suggestion.length} characters`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

const TrendingTopics = ({ 
  onSelectTopic 
}: { 
  onSelectTopic: (topic: string) => void 
}) => {
  const trendingTopics: TrendingTopic[] = [
    { name: 'AI Technology', volume: 125000 },
    { name: 'Remote Work', volume: 89000 },
    { name: 'Sustainability', volume: 76000 },
    { name: 'Digital Marketing', volume: 65000 },
    { name: 'Mental Health', volume: 54000 }
  ]

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <TrendingUp size={16} />
        <Typography variant="subtitle2">Trending Topics</Typography>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
        {trendingTopics.map((topic, index) => (
          <Chip
            key={index}
            label={topic.name}
            size="small"
            variant="outlined"
            onClick={() => onSelectTopic(topic.name)}
            sx={{ cursor: 'pointer' }}
            icon={<TrendingUp size={14} />}
          />
        ))}
      </Stack>
    </Box>
  )
}

const OptimalTiming = () => {
  const [recommendedTimes, setRecommendedTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const getOptimalTimes = useCallback(async () => {
    setLoading(true)
    try {
      const response = await client.get('/api/schedule/recommend')
      setRecommendedTimes(response.data.data.times || [])
    } catch (error) {
      console.error('Error getting optimal times:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Target size={16} />
        <Typography variant="subtitle2">Optimal Posting Times</Typography>
        <Button 
          size="small" 
          onClick={getOptimalTimes}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Clock size={16} />}
        >
          Get Times
        </Button>
      </Box>
      
      {recommendedTimes.length > 0 && (
        <Stack spacing={0.5}>
          {recommendedTimes.map((time, index) => (
            <Chip
              key={index}
              label={new Date(time).toLocaleString()}
              size="small"
              variant="outlined"
              icon={<Calendar size={14} />}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}

export default function EnhancedTweetComposer() {
  const [content, setContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft')
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  
  const queryClient = useQueryClient()

  const createTweetMutation = useMutation({
    mutationFn: async (tweetData: any) => {
      return client.post('/api/tweets', tweetData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tweets'] })
      setContent('')
      setScheduledAt('')
      setStatus('draft')
      setMediaUrls([])
      setHashtags([])
    }
  })

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const form = new FormData()
    Array.from(files).slice(0, 4).forEach(f => form.append('media', f))
    const res = await client.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    setMediaUrls(prev => [...prev, ...(res.data.data.urls as string[])])
  }

  const handleAddHashtag = (hashtag: string) => {
    if (!hashtags.includes(hashtag) && content.length + hashtag.length + 1 <= MAX_CHARACTERS) {
      setContent(prev => prev + ' ' + hashtag)
      setHashtags(prev => [...prev, hashtag])
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setContent(suggestion)
  }

  const handleSelectTopic = (topic: string) => {
    setContent(prev => prev + ` Thoughts on ${topic}: `)
  }

  const handleCreateTweet = () => {
    const fullContent = content.trim()
    if (!fullContent) return

    const tweetData = {
      content: fullContent,
      scheduledAt: scheduledAt || new Date().toISOString(),
      status,
      media: mediaUrls
    }

    createTweetMutation.mutate(tweetData)
  }

  const canPost = content.trim().length > 0 && content.length <= MAX_CHARACTERS
  const isOverLimit = content.length > MAX_CHARACTERS

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Create Tweet
        </Typography>
        
        <Stack spacing={3}>
          {/* Content Input */}
          <Box>
            <TextField
              label="What's happening?"
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Share your thoughts..."
              error={isOverLimit}
              helperText={isOverLimit ? 'Tweet is too long' : ''}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <CharacterCounter count={content.length} />
              {hashtags.length > 0 && (
                <Stack direction="row" spacing={0.5}>
                  {hashtags.map((hashtag, index) => (
                    <Chip
                      key={index}
                      label={hashtag}
                      size="small"
                      onDelete={() => {
                        setHashtags(prev => prev.filter((_, i) => i !== index))
                        setContent(prev => prev.replace(hashtag, '').replace(/\s+/g, ' ').trim())
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Box>

          {/* AI Suggestions */}
          <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
            <Stack spacing={2}>
              <ContentSuggestions onSelectSuggestion={handleSelectSuggestion} />
              <Divider />
              <HashtagSuggestions content={content} onAddHashtag={handleAddHashtag} />
              <Divider />
              <TrendingTopics onSelectTopic={handleSelectTopic} />
              <Divider />
              <OptimalTiming />
            </Stack>
          </Paper>

          {/* Media Upload */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <ImageIcon size={16} />
              <Typography variant="subtitle2">Media</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon size={16} />}
                size="small"
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </Button>
              {mediaUrls.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {mediaUrls.length} file(s) uploaded
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Schedule Options */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Calendar size={16} />
              <Typography variant="subtitle2">Schedule</Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Schedule Date & Time"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Button
                variant={status === 'draft' ? 'contained' : 'outlined'}
                onClick={() => setStatus('draft')}
                size="small"
              >
                Save Draft
              </Button>
              <Button
                variant={status === 'scheduled' ? 'contained' : 'outlined'}
                onClick={() => setStatus('scheduled')}
                size="small"
              >
                Schedule
              </Button>
            </Stack>
          </Box>

          {/* Error Display */}
          {createTweetMutation.isError && (
            <Alert severity="error">
              Failed to create tweet. Please try again.
            </Alert>
          )}

          {/* Action Buttons */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {status === 'draft' ? 'Will be saved as draft' : 'Will be scheduled for posting'}
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateTweet}
              disabled={!canPost || createTweetMutation.isPending}
              startIcon={createTweetMutation.isPending ? <CircularProgress size={16} /> : <Send size={16} />}
            >
              {createTweetMutation.isPending ? 'Creating...' : 'Create Tweet'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
