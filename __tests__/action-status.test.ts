import { cycleStatus } from '../lib/action-status'

describe('action-status', () => {
  describe('cycleStatus', () => {
    it('cycles todo -> doing', () => {
      expect(cycleStatus('todo')).toBe('doing')
    })

    it('cycles doing -> done', () => {
      expect(cycleStatus('doing')).toBe('done')
    })

    it('cycles done -> todo', () => {
      expect(cycleStatus('done')).toBe('todo')
    })
  })
})
