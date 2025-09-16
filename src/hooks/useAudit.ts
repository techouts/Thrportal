import { useAuth } from '@/auth/AuthContext'
import { auditService } from '@/services/auditService'

export function useAudit() {
  const { user } = useAuth()

  const logSettingsChange = async (
    section: string,
    setting: string,
    before: any,
    after: any,
    reason?: string
  ) => {
    if (!user) return

    await auditService.logSettingsChange(
      user.email,
      user.role,
      section,
      setting,
      before,
      after,
      reason
    )
  }

  const logAction = async (
    action: string,
    target: string,
    details?: any,
    reason?: string
  ) => {
    if (!user) return

    await auditService.logChange({
      actor: user.email,
      actorRole: user.role,
      action,
      target,
      after: details,
      reason,
      category: 'settings'
    })
  }

  return {
    logSettingsChange,
    logAction
  }
}