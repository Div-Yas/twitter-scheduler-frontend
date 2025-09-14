import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Box, 
  Stack,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material'
import { 
  TrendingUp, 
  TrendingDown, 
  MessageCircle, 
  Heart, 
  Repeat, 
  Eye,
  Calendar,
  Target,
  BarChart3,
  Activity
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  Legend
} from 'recharts'
import { client } from '@/api/client'

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

type AnalyticsData = {
  total: number
  scheduled: number
  posted: number
  drafts: number
  performance: {
    counts: {
      total: number
      viral: number
      performing: number
      underperforming: number
    }
    scored: Array<{
      id: string
      name: string
      score: number
      bucket: 'viral' | 'performing' | 'underperforming'
    }>
  }
}

const COLORS = {
  viral: '#10b981',
  performing: '#3b82f6', 
  underperforming: '#ef4444'
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'primary' 
}: {
  title: string
  value: number | string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'primary' | 'success' | 'error' | 'warning'
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return '#10b981'
      case 'down': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} />
      case 'down': return <TrendingDown size={16} />
      default: return null
    }
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend && trendValue && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                {getTrendIcon()}
                <Typography 
                  variant="caption" 
                  sx={{ color: getTrendColor() }}
                >
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: 2, 
              backgroundColor: `${color}.light`,
              color: `${color}.main`
            }}
          >
            <Icon size={24} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

const PerformanceChart = ({ data }: { data: AnalyticsData }) => {
  const chartData = useMemo(() => {
    const { scored } = data.performance
    return scored.slice(0, 10).map((tweet, index) => ({
      name: `Tweet ${index + 1}`,
      score: tweet.score,
      bucket: tweet.bucket,
      engagement: tweet.score
    }))
  }, [data])

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Performing Tweets
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  value.toLocaleString(), 
                  name === 'score' ? 'Engagement Score' : name
                ]}
              />
              <Bar 
                dataKey="score" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

const EngagementTrends = ({ tweets }: { tweets: Tweet[] }) => {
  const chartData = useMemo(() => {
    const postedTweets = tweets.filter(t => t.status === 'posted')
    return postedTweets.slice(-7).map((tweet, index) => ({
      day: `Day ${index + 1}`,
      impressions: tweet.impressions || 0,
      likes: tweet.likes || 0,
      retweets: tweet.retweets || 0,
      engagement: (tweet.likes || 0) + (tweet.retweets || 0) * 2
    }))
  }, [tweets])

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Engagement Trends (Last 7 Posts)
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="impressions" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="Impressions"
              />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                stackId="2" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
                name="Engagement"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

const PerformanceDistribution = ({ data }: { data: AnalyticsData }) => {
  const pieData = [
    { name: 'Viral', value: data.performance.counts.viral, color: COLORS.viral },
    { name: 'Performing', value: data.performance.counts.performing, color: COLORS.performing },
    { name: 'Underperforming', value: data.performance.counts.underperforming, color: COLORS.underperforming }
  ].filter(item => item.value > 0) // Only show segments with values > 0

  const total = data.performance.counts.total

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Distribution
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                // label={({ name, percent }) => 
                //   `${name}\n${(percent * 100).toFixed(0)}%`
                // }
                outerRadius={100}
                innerRadius={20}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value} tweets (${((value / total) * 100).toFixed(1)}%)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Stack spacing={1} mt={2}>
          {[
            { name: 'Viral', value: data.performance.counts.viral, color: COLORS.viral },
            { name: 'Performing', value: data.performance.counts.performing, color: COLORS.performing },
            { name: 'Underperforming', value: data.performance.counts.underperforming, color: COLORS.underperforming }
          ].map((item) => (
            <Box key={item.name} display="flex" alignItems="center" gap={1}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: item.color 
                }} 
              />
              <Typography variant="body2">{item.name}</Typography>
              <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold' }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

const ContentInsights = ({ tweets }: { tweets: Tweet[] }) => {
  const insights = useMemo(() => {
    const postedTweets = tweets.filter(t => t.status === 'posted')
    const totalImpressions = postedTweets.reduce((sum, t) => sum + (t.impressions || 0), 0)
    const totalLikes = postedTweets.reduce((sum, t) => sum + (t.likes || 0), 0)
    const totalRetweets = postedTweets.reduce((sum, t) => sum + (t.retweets || 0), 0)
    const avgEngagement = postedTweets.length > 0 ? (totalLikes + totalRetweets) / postedTweets.length : 0
    const engagementRate = totalImpressions > 0 ? ((totalLikes + totalRetweets) / totalImpressions) * 100 : 0

    return {
      totalImpressions,
      totalLikes,
      totalRetweets,
      avgEngagement: Math.round(avgEngagement),
      engagementRate: Math.round(engagementRate * 100) / 100
    }
  }, [tweets])

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Content Insights
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2">Engagement Rate</Typography>
              <Typography variant="body2" fontWeight="bold">
                {insights.engagementRate}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(insights.engagementRate * 10, 100)} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          
          <Divider />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {insights.totalImpressions.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Impressions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" color="success.main">
                  {insights.totalLikes.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Likes
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" color="info.main">
                  {insights.totalRetweets.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Retweets
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center">
                <Typography variant="h6" color="warning.main">
                  {insights.avgEngagement}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Engagement
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function EnhancedAnalytics() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => (await client.get('/api/analytics')).data.data as AnalyticsData,
    refetchInterval: 30000
  })

  const { data: tweets, isLoading: tweetsLoading } = useQuery({
    queryKey: ['tweets'],
    queryFn: async () => (await client.get('/api/tweets')).data.data as Tweet[]
  })

  if (analyticsLoading || tweetsLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading analytics...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!analytics || !tweets) {
    return (
      <Card>
        <CardContent>
          <Typography>No analytics data available</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Tweets"
            value={analytics.total}
            icon={MessageCircle}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Scheduled"
            value={analytics.scheduled}
            icon={Calendar}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Posted"
            value={analytics.posted}
            icon={Target}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Drafts"
            value={analytics.drafts}
            icon={Activity}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <PerformanceChart data={analytics} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <PerformanceDistribution data={analytics} />
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <EngagementTrends tweets={tweets} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ContentInsights tweets={tweets} />
        </Grid>
      </Grid>
    </Box>
  )
}
