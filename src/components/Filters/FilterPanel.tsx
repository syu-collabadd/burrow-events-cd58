import { SlidersHorizontal, Clock } from 'lucide-react'
import { CATEGORIES, type EventCategory } from '../../types'

type TimeFilter = 'all' | 'today' | 'this-week' | 'this-weekend'

interface FilterPanelProps {
  selectedCategories: EventCategory[]
  onCategoriesChange: (cats: EventCategory[]) => void
  timeFilter: TimeFilter
  onTimeFilterChange: (t: TimeFilter) => void
  eventCount: number
}

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-weekend', label: 'Weekend' },
]

export function FilterPanel({
  selectedCategories,
  onCategoriesChange,
  timeFilter,
  onTimeFilterChange,
  eventCount,
}: FilterPanelProps) {
  function toggleCategory(cat: EventCategory) {
    if (selectedCategories.includes(cat)) {
      onCategoriesChange(selectedCategories.filter(c => c !== cat))
    } else {
      onCategoriesChange([...selectedCategories, cat])
    }
  }

  const allSelected = selectedCategories.length === 0

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-semibold">Filters</span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {eventCount} event{eventCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Time filter */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
          <Clock className="w-3 h-3" />
          When
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TIME_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onTimeFilterChange(opt.value)}
              className={`filter-chip ${timeFilter === opt.value ? 'active' : 'inactive'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div>
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Category</div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onCategoriesChange([])}
            className={`filter-chip ${allSelected ? 'active' : 'inactive'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => toggleCategory(cat.value)}
              className={`filter-chip flex items-center gap-1 ${
                !allSelected && selectedCategories.includes(cat.value) ? 'active' : 'inactive'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
