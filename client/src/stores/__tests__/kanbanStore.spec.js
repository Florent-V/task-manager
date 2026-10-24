import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useKanbanStore } from '@/stores/kanbanStore.js'

const getPriorities = vi.fn()
const getSizes = vi.fn()
const getKanban = vi.fn()

vi.mock('@/services/taskService.js', () => ({
  TaskService: class {
    getPriorities = getPriorities
    getSizes = getSizes
  }
}))

vi.mock('@/services/kanbanService.js', () => ({
  KanbanService: class {
    getKanban = getKanban
  }
}))

vi.mock('@/utils/logger.js', () => ({
  default: { debug: vi.fn(), error: vi.fn() }
}))

const priorities = [{ id: 1, label: 'High', color: 'red' }]
const sizes = [{ id: 2, label: 'M', color: 'blue' }]
const users = [{ id: 3, firstName: 'Ada', lastName: 'Lovelace' }]
const stages = [{ id: 4, name: 'To do' }]
const rawTask = { id: 10, priorityId: 1, sizeId: 2, stageId: 4, assignedToId: 3, estimation: 90 }

describe('kanbanStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    getPriorities.mockResolvedValue({ priorities })
    getSizes.mockResolvedValue({ sizes })
    getKanban.mockResolvedValue({ kanban: { id: 'k1', users, stages, tasks: [rawTask] } })
  })

  it('initStore loads reference data and enriches tasks', async () => {
    const store = useKanbanStore()

    await store.initStore('k1')

    expect(store.currentKanbanId).toBe('k1')
    expect(store.priorities).toEqual(priorities)
    expect(store.sizes).toEqual(sizes)
    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0]).toMatchObject({
      priorityLabel: 'High',
      priorityColor: 'red',
      sizeLabel: 'M',
      stageLabel: 'To do',
      estimationString: '1h 30m',
      assignedTo: 'Ada Lovelace'
    })
  })

  it('initStore does not refetch the same kanban', async () => {
    const store = useKanbanStore()
    await store.initStore('k1')
    await store.initStore('k1')
    expect(getKanban).toHaveBeenCalledTimes(1)
  })

  it('enrichTask falls back to defaults for unknown references', () => {
    const task = useKanbanStore().enrichTask({ id: 1 })
    expect(task).toMatchObject({
      priorityLabel: 'Unknown',
      priorityColor: 'gray',
      sizeLabel: 'Unknown',
      stageLabel: 'Unknown',
      estimationString: '0m',
      assignedTo: 'Unassigned'
    })
  })

  it('adds, edits and deletes tasks', async () => {
    const store = useKanbanStore()
    await store.initStore('k1')

    store.addTask({ id: 11, priorityId: 1 })
    expect(store.getTaskById(11).priorityLabel).toBe('High')

    store.editTask({ id: 11, priorityId: 999 })
    expect(store.getTaskById(11).priorityLabel).toBe('Unknown')

    store.deleteTask(11)
    expect(store.getTaskById(11)).toBeUndefined()
    expect(store.tasks).toHaveLength(1)
  })

  it('updateTasksImputations replaces imputations of a task', async () => {
    const store = useKanbanStore()
    await store.initStore('k1')
    store.updateTasksImputations(10, [{ id: 1 }])
    expect(store.getTaskById(10).imputations).toEqual([{ id: 1 }])
  })

  it('enriches comments and imputations with users', async () => {
    const store = useKanbanStore()
    await store.initStore('k1')

    expect(store.enrichComments([{ authorId: 3 }, { authorId: 999 }]).map((c) => c.authorName))
      .toEqual(['Ada Lovelace', 'Unknown User'])
    expect(store.enrichImputation({ userId: 3 }).user).toEqual(users[0])
  })

  it('reset empties the state', async () => {
    const store = useKanbanStore()
    await store.initStore('k1')
    store.reset()
    expect(store.currentKanbanId).toBeNull()
    expect(store.tasks).toEqual([])
    expect(store.priorities).toEqual([])
  })
})
