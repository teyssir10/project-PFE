export type Quiz = {
  id: string
  title: string
  difficulty: string
  creator_name: string | null  
  featured: boolean             
  is_community: boolean
  question_count: number        
  duration: number
  players: number
  description: string | null
  is_published: boolean
  emoji?: string | null       
  created_at: string
}