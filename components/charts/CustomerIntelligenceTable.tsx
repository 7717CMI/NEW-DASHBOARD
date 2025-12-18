'use client'

import { useState, useEffect } from 'react'
import { useDashboardStore } from '@/lib/store'
import { Users } from 'lucide-react'

interface ParentHeader {
  name: string
  startCol: number
  colSpan: number
}

interface PropositionData {
  headers: string[]
  rows: Record<string, any>[]
  parentHeaders?: ParentHeader[] | null
}

// Define colors for parent headers - matching Excel style
const parentHeaderColors: Record<string, string> = {
  // Green family - Company/Business related
  'company': '#90EE90',
  'business': '#90EE90',
  'organization': '#90EE90',

  // Blue family - Contact/Communication related
  'contact': '#87CEEB',
  'communication': '#87CEEB',

  // Cyan/Teal family - Fleet/Operations related
  'fleet': '#B0E0E6',
  'operation': '#B0E0E6',
  'aircraft': '#B0E0E6',

  // Yellow/Amber family - Procurement/Purchasing related
  'procurement': '#FFFACD',
  'purchasing': '#FFFACD',
  'spare': '#FFFACD',

  // Light Yellow family - Growth/Expansion related
  'growth': '#FAFAD2',
  'expansion': '#FAFAD2',

  // Pink family - Insights/Notes related
  'cmi': '#FFB6C1',
  'insight': '#FFB6C1',
  'comment': '#FFB6C1',
  'note': '#FFB6C1',

  // Maintenance related
  'maintenance': '#FFF8DC',

  // Product related
  'product': '#DDA0DD',

  // Financial related
  'financial': '#FFE4E1',
  'payment': '#FFE4E1',

  // Location related
  'location': '#98FB98',
  'region': '#98FB98',
}

// Get color for a parent header based on its name
const getParentHeaderColor = (name: string): string => {
  if (!name || name.trim() === '') {
    return '#FFE082'
  }
  const lowerName = name.toLowerCase()
  for (const [key, color] of Object.entries(parentHeaderColors)) {
    if (lowerName.includes(key)) {
      return color
    }
  }
  return '#FFE082'
}

// Table component for displaying proposition data
function PropositionTableContent({ data }: { data: PropositionData }) {
  const headers = data.headers || Object.keys(data.rows[0] || {})
  const parentHeaders = data.parentHeaders

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Parent Headers Row (if available) */}
        {parentHeaders && parentHeaders.length > 0 && (
          <thead>
            <tr>
              {parentHeaders.map((ph, index) => (
                <th
                  key={index}
                  colSpan={ph.colSpan}
                  className="px-4 py-3 text-center text-sm font-bold text-black uppercase tracking-wider border-r border-gray-300 last:border-r-0"
                  style={{
                    backgroundColor: getParentHeaderColor(ph.name)
                  }}
                >
                  {ph.name || ''}
                </th>
              ))}
            </tr>
          </thead>
        )}
        {/* Child Headers Row - Yellow Theme */}
        <thead>
          <tr style={{ backgroundColor: '#FFE082' }}>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-yellow-300 last:border-r-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        {/* Table Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {data.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}
            >
              {headers.map((header, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-3 text-sm text-black border-r border-gray-100 last:border-r-0"
                >
                  {row[header] !== undefined && row[header] !== null && row[header] !== ''
                    ? String(row[header])
                    : <span className="text-gray-400">-</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface CustomerIntelligenceTableProps {
  title?: string
}

type TabType = 'prop1' | 'prop2' | 'prop3'

export function CustomerIntelligenceTable({ title }: CustomerIntelligenceTableProps) {
  const {
    rawIntelligenceData,
    proposition2Data,
    proposition3Data,
    intelligenceType
  } = useDashboardStore()

  // Determine which tabs have data
  const hasProp1 = rawIntelligenceData && rawIntelligenceData.rows && rawIntelligenceData.rows.length > 0
  const hasProp2 = proposition2Data && proposition2Data.rows && proposition2Data.rows.length > 0
  const hasProp3 = proposition3Data && proposition3Data.rows && proposition3Data.rows.length > 0

  // Get the first available tab
  const getDefaultTab = (): TabType => {
    if (hasProp1) return 'prop1'
    if (hasProp2) return 'prop2'
    if (hasProp3) return 'prop3'
    return 'prop1'
  }

  const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab())

  // Update active tab when data changes
  useEffect(() => {
    const currentTabHasData =
      (activeTab === 'prop1' && hasProp1) ||
      (activeTab === 'prop2' && hasProp2) ||
      (activeTab === 'prop3' && hasProp3)

    if (!currentTabHasData) {
      setActiveTab(getDefaultTab())
    }
  }, [rawIntelligenceData, proposition2Data, proposition3Data])

  // Check if we have any data to display
  const hasData = hasProp1 || hasProp2 || hasProp3

  if (!hasData) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-black font-medium mb-2">No Customer Intelligence Data Available</p>
        <p className="text-sm text-gray-600">
          Upload Excel files in the Dashboard Builder to display customer intelligence tables.
        </p>
      </div>
    )
  }

  const typeLabel = intelligenceType === 'distributor' ? 'Distributor' : 'Customer'

  // Tab configuration
  const tabs = [
    { id: 'prop1' as TabType, label: 'Proposition 1', sublabel: 'Basic', hasData: hasProp1, count: rawIntelligenceData?.rows?.length || 0, color: '#FFC107' },
    { id: 'prop2' as TabType, label: 'Proposition 2', sublabel: 'Advance', hasData: hasProp2, count: proposition2Data?.rows?.length || 0, color: '#FFB300' },
    { id: 'prop3' as TabType, label: 'Proposition 3', sublabel: 'Premium', hasData: hasProp3, count: proposition3Data?.rows?.length || 0, color: '#FFA000' },
  ]

  // Get active data
  const getActiveData = (): PropositionData | null => {
    switch (activeTab) {
      case 'prop1': return rawIntelligenceData as PropositionData | null
      case 'prop2': return proposition2Data as PropositionData | null
      case 'prop3': return proposition3Data as PropositionData | null
      default: return null
    }
  }

  const activeData = getActiveData()
  const availableTabs = tabs.filter(tab => tab.hasData)

  return (
    <div className="w-full">
      {/* Main Title */}
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-black">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {typeLabel} intelligence data organized by proposition level
          </p>
        </div>
      )}

      {/* Tab Buttons */}
      <div className="flex gap-2 mb-4">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-black shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? tab.color : undefined
            }}
          >
            <span>{tab.label}</span>
            <span className={`text-xs ${activeTab === tab.id ? 'text-gray-700' : 'text-gray-500'}`}>
              ({tab.sublabel})
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-black/10 text-black' : 'bg-gray-200 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Table Content */}
      {activeData && activeData.rows && activeData.rows.length > 0 && (
        <PropositionTableContent data={activeData} />
      )}

      {/* Summary Footer */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">
            Total Records: {' '}
            <span className="font-semibold text-black">
              {(rawIntelligenceData?.rows?.length || 0) +
               (proposition2Data?.rows?.length || 0) +
               (proposition3Data?.rows?.length || 0)}
            </span>
          </span>
          <span className="text-gray-600">
            Available Propositions: {' '}
            {availableTabs.map(t => t.sublabel).join(', ') || 'None'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CustomerIntelligenceTable
