import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useResolutions } from '../../context/ResolutionContext'
import { useDelegates } from '../../context/DelegateContext'
import AddResolutionModal from './AddResolutionModal'

const COLUMN_CONFIG = {
    working_paper: { title: 'Working Papers', color: 'blue', icon: '📝', draggable: true },
    draft: { title: 'Draft Resolutions', color: 'purple', icon: '📋', draggable: true },
    passed: { title: 'Passed', color: 'green', icon: '✅', draggable: false },
    failed: { title: 'Failed', color: 'red', icon: '❌', draggable: false },
}

// Resolution card
function ResolutionCard({ resolution, onDelete, isDraggable }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: resolution.id, disabled: !isDraggable })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isDraggable ? { ...attributes, ...listeners } : {})}
            className={`p-3 bg-white rounded-lg border-2 border-slate-200 hover:border-kamun-royal/30 hover:shadow-md transition-all group ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <span className="font-mono text-sm text-kamun-royal font-bold">{resolution.code}</span>
                    {resolution.title && (
                        <p className="text-sm text-slate-600 mt-1 truncate">{resolution.title}</p>
                    )}
                    {resolution.sponsor && (
                        <p className="text-xs text-kamun-gold mt-1 font-medium">📋 {resolution.sponsor}</p>
                    )}
                    {resolution.signatories?.length > 0 && (
                        <p className="text-xs text-blue-500 mt-1">✎ {resolution.signatories.join(', ')}</p>
                    )}
                </div>
                {isDraggable && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(resolution.id)
                        }}
                        className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                        title="Delete"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
            {isDraggable && (
                <p className="text-xs text-slate-400 mt-2">Drag to move</p>
            )}
        </div>
    )
}

// Droppable column component
function DroppableColumn({ id, children, config, count }) {
    const { setNodeRef, isOver } = useDroppable({ id })

    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200',
        purple: 'bg-purple-50 border-purple-200',
        green: 'bg-green-50 border-green-200',
        red: 'bg-red-50 border-red-200',
    }

    return (
        <div className="flex flex-col h-full">
            <div className={`p-3 rounded-t-xl border-2 border-b-0 ${colorClasses[config.color]}`}>
                <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span className="font-bold text-kamun-navy">{config.title}</span>
                    <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-600">
                        {count}
                    </span>
                </div>
            </div>
            <div
                ref={setNodeRef}
                className={`flex-1 p-3 rounded-b-xl border-2 border-t-0 ${colorClasses[config.color]} overflow-y-auto transition-all ${isOver ? 'ring-2 ring-kamun-royal ring-inset bg-kamun-royal/5' : ''
                    }`}
            >
                <div className="space-y-2 min-h-[100px]">
                    {children}
                </div>
            </div>
        </div>
    )
}

function ResolutionTracker() {
    const { resolutions, isLoaded, addResolution, updateResolutionStatus, deleteResolution, getByStatus } = useResolutions()
    const { delegates } = useDelegates()

    const [activeItem, setActiveItem] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)

    // Group resolutions by status
    const groupedResolutions = useMemo(() => ({
        working_paper: getByStatus('working_paper'),
        draft: getByStatus('draft'),
        passed: getByStatus('passed'),
        failed: getByStatus('failed'),
    }), [getByStatus, resolutions])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragStart = (event) => {
        const id = event.active.id
        for (const items of Object.values(groupedResolutions)) {
            const found = items.find(item => item.id === id)
            if (found) {
                setActiveItem(found)
                break
            }
        }
    }

    const handleDragEnd = async (event) => {
        const { active, over } = event
        setActiveItem(null)
        if (!over) return

        const targetStatus = over.id
        if (targetStatus !== 'working_paper' && targetStatus !== 'draft') return

        let currentStatus = null
        for (const [status, items] of Object.entries(groupedResolutions)) {
            if (items.find(item => item.id === active.id)) {
                currentStatus = status
                break
            }
        }

        if (currentStatus && currentStatus !== targetStatus) {
            await updateResolutionStatus(active.id, targetStatus)
        }
    }

    const handleAddResolution = async (data) => {
        await addResolution(data.code, data.title, data.sponsor, data.signatories)
    }

    const handleDelete = async (id) => {
        if (confirm('Delete this resolution?')) {
            await deleteResolution(id)
        }
    }

    if (!isLoaded) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-kamun-royal/20 border-t-kamun-royal rounded-full animate-spin" />
                    <p className="text-slate-400">Loading resolutions...</p>
                </div>
            </div>
        )
    }

    const draggableItems = [
        ...groupedResolutions.working_paper.map(r => r.id),
        ...groupedResolutions.draft.map(r => r.id),
    ]

    return (
        <>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-kamun-navy">Resolution Tracker</h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Drag between Working Papers ↔ Draft • Passed/Failed auto-populate after voting
                        </p>
                    </div>

                    {/* Add New Resolution Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-royal flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Resolution
                    </button>
                </div>

                {/* Kanban Board */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={draggableItems}>
                        <div className="flex-1 grid grid-cols-4 gap-4 overflow-hidden">
                            {Object.entries(COLUMN_CONFIG).map(([status, config]) => {
                                const items = groupedResolutions[status] || []

                                return (
                                    <DroppableColumn key={status} id={status} config={config} count={items.length}>
                                        {items.length === 0 ? (
                                            <div className="h-24 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-300 rounded-lg">
                                                {config.draggable ? 'Drop here' : 'Auto-populated'}
                                            </div>
                                        ) : (
                                            items.map((resolution) => (
                                                <ResolutionCard
                                                    key={resolution.id}
                                                    resolution={resolution}
                                                    isDraggable={config.draggable}
                                                    onDelete={handleDelete}
                                                />
                                            ))
                                        )}
                                    </DroppableColumn>
                                )
                            })}
                        </div>
                    </SortableContext>

                    <DragOverlay>
                        {activeItem && (
                            <div className="p-3 bg-white rounded-lg border-2 border-kamun-royal shadow-xl">
                                <span className="font-mono text-sm text-kamun-royal font-bold">{activeItem.code}</span>
                                {activeItem.title && (
                                    <p className="text-sm text-slate-600 mt-1">{activeItem.title}</p>
                                )}
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Add Resolution Modal */}
            <AddResolutionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddResolution}
                delegates={delegates}
            />
        </>
    )
}

export default ResolutionTracker
