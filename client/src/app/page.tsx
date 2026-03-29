import { Card } from '@/components/Card'
import { Button } from '@/components/Button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI Monsters
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            A 2D card game where every card is AI-generated and unique
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="primary">Play Now</Button>
            <Button variant="secondary">Learn More</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card 
            name="Fire Dragon" 
            description="A majestic dragon that breathes scorching flames"
            attack={85} 
            defense={60} 
            range={2}
            rarity="Legendary"
            type="Unit"
          />
          <Card 
            name="Ice Wizard" 
            description="Master of frost magic with freezing spells"
            attack={45} 
            defense={40} 
            range={3}
            rarity="Rare"
            type="Unit"
          />
          <Card 
            name="Lightning Bolt" 
            description="A powerful spell that strikes from above"
            attack={70} 
            defense={0} 
            range={4}
            rarity="Epic"
            type="Spell"
          />
          <Card 
            name="Castle Tower" 
            description="A sturdy defensive structure with archers"
            attack={0} 
            defense={120} 
            range={2}
            rarity="Rare"
            type="Building"
          />
        </div>
      </div>
    </main>
  )
}